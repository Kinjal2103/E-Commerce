/**
 * Hardware Compatibility & FPS Estimation Service
 * Consolidates matching rules for sockets, memory types, dimensions, power requirements,
 * and calculates game FPS estimates dynamically based on CPU and GPU choice.
 */

const { GAMES } = require('../data/referenceData');

/**
 * Parses numeric value from spec strings (e.g. "300mm" -> 300, "125W" -> 125)
 */
const parseSpecNumber = (val) => {
  if (val === undefined || val === null) return 0;
  if (typeof val === 'number') return val;
  const num = parseInt(String(val).replace(/[^0-9]/g, ''), 10);
  return isNaN(num) ? 0 : num;
};

/**
 * Validates a complete or partial PC build configuration.
 * @param {Object} parts - Dictionary of components in the build
 * @returns {Object} { alerts, score, tdp, psuWatt }
 */
const checkCompatibility = (parts = {}) => {
  const alerts = [];
  let score = 100;

  const { cpu, motherboard, gpu, ram, psu, cooler, case: pcCase } = parts;
  const storage = parts.ssd || parts.storage;

  // 1. Completeness check
  const selectedCount = Object.values({ cpu, motherboard, gpu, ram, psu, cooler, pcCase, storage }).filter(Boolean).length;
  if (selectedCount === 0) {
    return {
      alerts: [{ type: 'info', text: 'Select components to run the compatibility engine.' }],
      score: 100,
      tdp: 0,
      psuWatt: 0
    };
  }

  // 2. TDP Calculations
  let calculatedTDP = 80; // Baseline motherboard & SSD power draw
  if (cpu) {
    const cpuTdp = parseSpecNumber(cpu.specs?.['TDP'] || cpu.specs?.tdp_watts);
    calculatedTDP += cpuTdp || 120;
  }
  if (gpu) {
    const gpuTdp = parseSpecNumber(gpu.specs?.['TDP'] || gpu.specs?.tdp_watts);
    calculatedTDP += gpuTdp || 250;
  }
  if (cooler && (cooler.specs?.['Radiator Size'] || String(cooler.specs?.height_mm).toLowerCase().includes('aio') || String(cooler.name).toLowerCase().includes('liquid'))) {
    calculatedTDP += 25; // AIO Liquid cooler pumps draw extra power
  }

  // 3. PSU Check
  let psuWatt = 0;
  if (psu) {
    psuWatt = parseSpecNumber(psu.specs?.['Wattage'] || psu.specs?.wattage);
    if (psuWatt === 0) psuWatt = 850; // Fallback

    if (psuWatt < calculatedTDP) {
      score -= 30;
      alerts.push({
        type: 'error',
        text: `Insufficient Wattage: Selected PSU is ${psuWatt}W but estimated load requires at least ${calculatedTDP}W.`
      });
    } else if (psuWatt < calculatedTDP + 150) {
      score -= 10;
      alerts.push({
        type: 'warning',
        text: `Low PSU Overhead: PSU provides ${psuWatt}W. We recommend 150W-200W safety overhead for boost transients.`
      });
    } else {
      alerts.push({
        type: 'success',
        text: `PSU Wattage sufficient: ${psuWatt}W provides a safe ${Math.round(((psuWatt - calculatedTDP) / psuWatt) * 100)}% overhead.`
      });
    }
  }

  // 4. CPU & Motherboard Socket Check
  let cpuSocket = '';
  if (cpu && motherboard) {
    cpuSocket = cpu.specs?.['Socket Type'] || cpu.specs?.socket || '';
    const mbSocket = motherboard.specs?.['Socket Type'] || motherboard.specs?.socket || '';
    
    if (cpuSocket && mbSocket && cpuSocket.trim().toUpperCase() !== mbSocket.trim().toUpperCase()) {
      score -= 40;
      alerts.push({
        type: 'error',
        text: `Socket Conflict: CPU requires socket ${cpuSocket} but motherboard has socket ${mbSocket}.`
      });
    } else {
      alerts.push({
        type: 'success',
        text: `Compatible Sockets: CPU and Motherboard both support socket ${cpuSocket || mbSocket}.`
      });
    }
  }

  // 5. RAM & Motherboard slots check (DDR5 vs DDR4)
  if (ram && motherboard) {
    const ramType = (ram.specs?.['Type'] || ram.specs?.type || '').trim().toUpperCase();
    const mbRamSlots = (motherboard.specs?.['RAM Slots'] || motherboard.specs?.memory_type || motherboard.specs?.memory_support || '').trim().toUpperCase();
    
    if (ramType && mbRamSlots && !mbRamSlots.includes(ramType)) {
      score -= 30;
      alerts.push({
        type: 'error',
        text: `RAM Mismatch: RAM modules are ${ramType} but Motherboard supports ${mbRamSlots}.`
      });
    } else {
      alerts.push({
        type: 'success',
        text: `Compatible memory slots: RAM standard matches Motherboard slots.`
      });
    }
  }

  // 6. Cabinet Case GPU length clearance check
  if (gpu && pcCase) {
    const gpuLen = parseSpecNumber(gpu.specs?.['Length'] || gpu.specs?.length_mm);
    const caseLen = parseSpecNumber(pcCase.specs?.['Max GPU Length'] || pcCase.specs?.max_gpu_length_mm);
    
    if (gpuLen > 0 && caseLen > 0 && gpuLen > caseLen) {
      score -= 20;
      alerts.push({
        type: 'error',
        text: `Cabinet Space Conflict: Case fits up to ${caseLen}mm GPUs but selected GPU length is ${gpuLen}mm.`
      });
    } else {
      alerts.push({
        type: 'success',
        text: `GPU Clearance verified: GPU fits comfortably inside the selected case.`
      });
    }
  }

  // 7. Case Motherboard Form Factor check
  if (pcCase && motherboard) {
    const mbForm = (motherboard.specs?.['Form Factor'] || motherboard.specs?.form_factor || '').trim().toUpperCase();
    const caseSupport = (pcCase.specs?.motherboard_support || pcCase.specs?.['Motherboard Support'] || []);
    
    if (mbForm && caseSupport.length > 0) {
      const isCompat = caseSupport.some(s => s.trim().toUpperCase() === mbForm);
      if (!isCompat) {
        score -= 15;
        alerts.push({
          type: 'error',
          text: `Motherboard form factor (${mbForm}) is not supported by the Case (supports: ${caseSupport.join(', ')}).`
        });
      }
    }
  }

  // 8. CPU Cooler socket compatibility check
  if (cooler && cpu) {
    if (!cpuSocket) cpuSocket = cpu.specs?.['Socket Type'] || cpu.specs?.socket || '';
    const coolerSockets = (cooler.specs?.socket_compatibility || cooler.specs?.['Socket Compatibility'] || []);
    
    if (cpuSocket && coolerSockets.length > 0) {
      const isCompat = coolerSockets.some(s => s.trim().toUpperCase() === cpuSocket.trim().toUpperCase());
      if (!isCompat) {
        score -= 15;
        alerts.push({
          type: 'warning',
          text: `Cooler does not officially support CPU socket ${cpuSocket}. Supported sockets: ${coolerSockets.join(', ')}.`
        });
      }
    }
  }

  // 9. CPU Cooler height clearance check
  if (cooler && pcCase) {
    const coolerHeight = parseSpecNumber(cooler.specs?.['Height'] || cooler.specs?.height_mm);
    const maxCoolerHeight = parseSpecNumber(pcCase.specs?.['Max Cooler Height'] || pcCase.specs?.max_cpu_cooler_height_mm);
    
    if (coolerHeight > 0 && maxCoolerHeight > 0 && coolerHeight > maxCoolerHeight) {
      score -= 15;
      alerts.push({
        type: 'error',
        text: `Cooler Height Conflict: CPU cooler height (${coolerHeight}mm) exceeds maximum case clearance (${maxCoolerHeight}mm).`
      });
    }
  }

  // General success check
  if (alerts.filter(a => a.type === 'error').length === 0 && score === 100) {
    alerts.unshift({ type: 'success', text: 'All checked components are compatible!' });
  }

  return {
    alerts,
    score: Math.max(10, score),
    tdp: calculatedTDP,
    psuWatt
  };
};

/**
 * Estimates gaming FPS performance for a PC build configuration across multiple titles.
 * @param {Object} parts - Selected components dictionary
 * @param {String} resolution - Target resolution ("1080p", "1440p", "4K")
 * @param {Array} games - List of games reference databases
 * @returns {Array} List of estimated game FPS objects
 */
const estimateFPSForBuild = (parts = {}, resolution = '1440p', games = GAMES) => {
  const { cpu, gpu } = parts;

  // CPU Coefficient
  let cpuCoeff = 0.2;
  if (cpu) {
    const cpuName = String(cpu.name || cpu.id || '').toLowerCase();
    if (cpuName.includes('14900k')) cpuCoeff = 1.0;
    else if (cpuName.includes('7800x3d')) cpuCoeff = 1.05;
    else cpuCoeff = 0.9;
  }

  // GPU Coefficient
  let gpuCoeff = 0.15;
  if (gpu) {
    const gpuName = String(gpu.name || gpu.id || '').toLowerCase();
    if (gpuName.includes('4090')) gpuCoeff = 1.0;
    else if (gpuName.includes('7900xtx')) gpuCoeff = 0.85;
    else gpuCoeff = 0.72;
  }

  const resolutionFactors = { '1080p': 1.15, '1440p': 0.82, '4K': 0.44 };
  const resFactor = resolutionFactors[resolution] || 0.82;

  return games.map((game) => {
    const baseFps = game.resolutionFPS?.['1440p'] || 100;
    const estimatedFps = Math.round(baseFps * cpuCoeff * gpuCoeff * (resFactor / 0.82));
    return {
      name: game.name,
      fps: estimatedFps
    };
  });
};

module.exports = {
  checkCompatibility,
  estimateFPSForBuild,
  parseSpecNumber
};
