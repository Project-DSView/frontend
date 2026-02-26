const generateMemoryAddress = (
  index: number,
  baseAddress: number = 0x100,
  step: number = 4,
): string => {
  const address = baseAddress + index * step;
  // Ensure we output proper 3-digit hex (e.g. 0x004) or more if needed
  return `0x${address.toString(16).toUpperCase().padStart(3, '0')}`;
};

const generateHashMemoryAddress = (value: string, baseAddress: number = 0x500): string => {
  // Generate distinct address based on value hash
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }
  // Use offset to keep it within a reasonable range (0 to 4095)
  const offset = Math.abs(hash) % 0xfff;
  const address = baseAddress + offset;
  return `0x${address.toString(16).toUpperCase().padStart(3, '0')}`;
};

export { generateMemoryAddress, generateHashMemoryAddress };
