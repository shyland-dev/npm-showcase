import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, computed, effect, inject, signal, viewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Location, NgTemplateOutlet } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AppShellComponent, IconButtonComponent, IconComponent, ThemeService, ThemeToggleComponent, TooltipDirective } from '@shyland-dev/ui';
import { DEVICES, Device, DeviceService } from './device.service';
import { NAV } from './nav';

const THEME_LABELS = { group: 'Tema', light: 'Claro', system: 'Sistema', dark: 'Escuro' };

@Component({
  selector: 'app-root',
  imports: [NgTemplateOutlet, RouterOutlet, RouterLink, RouterLinkActive, AppShellComponent, IconComponent, IconButtonComponent, ThemeToggleComponent, TooltipDirective],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly theme = inject(ThemeService);
  private readonly destroyRef = inject(DestroyRef);
  readonly deviceService = inject(DeviceService);

  readonly nav = NAV;
  readonly devices = DEVICES;
  readonly themeLabels = THEME_LABELS;

  /** Dentro do iframe do simulador: sem a barra de dispositivos. */
  readonly embedded = typeof window !== 'undefined' && window.parent !== window && new URLSearchParams(window.location.search).has('embed');

  /** As duas "versões" do site: retrato (sidebar em Drawer) e paisagem (sidebar fixa). */
  readonly portrait = signal(true);

  readonly device = computed<Device>(() => DEVICES.find((d) => d.id === this.deviceService.id()) ?? DEVICES[0]);
  readonly simulating = computed(() => !this.embedded && this.device().id !== 'auto');

  readonly frameSrc = signal<SafeResourceUrl | null>(null);
  private readonly frame = viewChild<ElementRef<HTMLIFrameElement>>('frame');
  private readonly stage = viewChild<ElementRef<HTMLElement>>('stage');
  private readonly stageSize = signal({ w: 0, h: 0 });

  /** Dimensões e escala do dispositivo simulado (cabe no palco, sem ampliar). */
  readonly frameBox = computed(() => {
    const d = this.device();
    const rotated = this.deviceService.rotated() && d.canRotate;
    const w = rotated ? d.height : d.width;
    const h = rotated ? d.width : d.height;
    const { w: sw, h: sh } = this.stageSize();
    const scale = sw && sh ? Math.min(1, sw / w, sh / h) : 1;
    return { w, h, scale, boxW: Math.floor(w * scale), boxH: Math.floor(h * scale) };
  });

  constructor() {
    if (typeof window === 'undefined') return;

    const mq = window.matchMedia('(orientation: portrait)');
    this.portrait.set(mq.matches);
    const onChange = (e: MediaQueryListEvent) => this.portrait.set(e.matches);
    mq.addEventListener('change', onChange);
    this.destroyRef.onDestroy(() => mq.removeEventListener('change', onChange));

    if (this.embedded) {
      const onMessage = (e: MessageEvent) => {
        if (e.origin !== window.location.origin) return;
        if (e.data?.type === 'shy-theme') this.theme.setMode(e.data.mode);
      };
      window.addEventListener('message', onMessage);
      this.destroyRef.onDestroy(() => window.removeEventListener('message', onMessage));
      this.router.events.subscribe((ev) => {
        if (ev instanceof NavigationEnd) window.parent.postMessage({ type: 'shy-route', url: ev.urlAfterRedirects }, window.location.origin);
      });
    } else {
      const onMessage = (e: MessageEvent) => {
        if (e.origin !== window.location.origin) return;
        // mantém a URL do pai em sincronia com o que acontece dentro do simulador
        if (e.data?.type === 'shy-route' && this.simulating() && this.router.url !== e.data.url) this.router.navigateByUrl(e.data.url, { replaceUrl: true, skipLocationChange: false });
      };
      window.addEventListener('message', onMessage);
      this.destroyRef.onDestroy(() => window.removeEventListener('message', onMessage));

      // (re)carrega o iframe só quando o dispositivo muda
      effect(() => {
        if (this.simulating()) {
          this.deviceService.id();
          this.frameSrc.set(this.sanitizer.bypassSecurityTrustResourceUrl(this.embedUrl()));
        } else {
          this.frameSrc.set(null);
        }
      });
      effect(() => {
        const mode = this.theme.mode();
        this.frame()?.nativeElement.contentWindow?.postMessage({ type: 'shy-theme', mode }, window.location.origin);
      });
    }

    const ro = new ResizeObserver(() => this.measure());
    this.destroyRef.onDestroy(() => ro.disconnect());
    effect(() => {
      const el = this.stage()?.nativeElement;
      ro.disconnect();
      if (el) ro.observe(el);
    });
  }

  private embedUrl(): string {
    const url = this.router.url.split('?')[0].split('#')[0];
    return this.location.prepareExternalUrl(url) + '?embed=1';
  }

  private measure(): void {
    const el = this.stage()?.nativeElement;
    if (el) this.stageSize.set({ w: el.clientWidth, h: el.clientHeight });
  }

  onFrameLoad(): void {
    this.frame()?.nativeElement.contentWindow?.postMessage({ type: 'shy-theme', mode: this.theme.mode() }, window.location.origin);
  }
}
