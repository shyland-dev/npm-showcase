import { Injectable, signal } from '@angular/core';

export type DeviceId = 'auto' | 'phone' | 'tablet' | 'notebook' | 'desktop' | 'tv';

export interface Device {
  id: DeviceId;
  label: string;
  icon: string;
  /** Pixels do dispositivo simulado (retrato). São pixels reais do viewport do iframe, não medidas de UI. */
  width: number;
  height: number;
  canRotate: boolean;
}

export const DEVICES: Device[] = [
  { id: 'auto', label: 'Este dispositivo', icon: 'window', width: 0, height: 0, canRotate: false },
  { id: 'phone', label: 'Celular 360×800', icon: 'phone', width: 360, height: 800, canRotate: true },
  { id: 'tablet', label: 'Tablet 768×1024', icon: 'tablet', width: 768, height: 1024, canRotate: true },
  { id: 'notebook', label: 'Notebook 1366×768', icon: 'laptop', width: 1366, height: 768, canRotate: false },
  { id: 'desktop', label: 'Desktop 1920×1080', icon: 'display', width: 1920, height: 1080, canRotate: false },
  { id: 'tv', label: 'TV 4K 3840×2160', icon: 'tv', width: 3840, height: 2160, canRotate: false },
];

const KEY = 'shy-showcase-device';

@Injectable({ providedIn: 'root' })
export class DeviceService {
  readonly id = signal<DeviceId>(this.read());
  readonly rotated = signal(false);

  set(id: DeviceId): void {
    this.id.set(id);
    this.rotated.set(false);
    try {
      localStorage.setItem(KEY, id);
    } catch {}
  }

  private read(): DeviceId {
    try {
      const v = localStorage.getItem(KEY) as DeviceId | null;
      if (v && DEVICES.some((d) => d.id === v)) return v;
    } catch {}
    return 'auto';
  }
}
