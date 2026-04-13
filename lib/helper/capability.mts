import { Device } from 'homey';

export async function addCapabilityIfNotExists(device: Device, capabilityId: string): Promise<void> {
  if (device.hasCapability(capabilityId)) {
    return;
  }

  await device.addCapability(capabilityId);
}

export async function removeCapabilityIfExists(device: Device, capabilityId: string): Promise<void> {
  if (!device.hasCapability(capabilityId)) {
    return;
  }

  await device.removeCapability(capabilityId);
}
