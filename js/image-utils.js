// Lecture, redimensionnement et compression des images choisies dans l'application.

function imageFitInside(width, height, maxDimension) {
  const ratio = Math.min(1, maxDimension / Math.max(width, height));
  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio)
  };
}

function imageCoverSquare(width, height, size) {
  const ratio = Math.max(size / width, size / height);
  const targetWidth = width * ratio;
  const targetHeight = height * ratio;
  return {
    width: targetWidth,
    height: targetHeight,
    x: (size - targetWidth) / 2,
    y: (size - targetHeight) / 2
  };
}

function processImageFile(file, transform) {
  return new Promise(resolve => {
    if (!file) { resolve(null); return; }
    const image = new Image();
    const url = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(url);
      try { resolve(transform(image)); }
      catch (error) { toast('Impossible de traiter cette image.'); resolve(null); }
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      toast('Impossible de lire cette image.');
      resolve(null);
    };
    image.src = url;
  });
}

function compressImagePng(file, maxDimension) {
  return processImageFile(file, image => {
    const dimensions = imageFitInside(image.width, image.height, maxDimension);
    const canvas = document.createElement('canvas');
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    canvas.getContext('2d').drawImage(image, 0, 0, dimensions.width, dimensions.height);
    const data = canvas.toDataURL('image/png');
    if (data.length > 420000) {
      toast('Cette image reste trop lourde même réduite — choisis un PNG plus simple.');
      return null;
    }
    return data;
  });
}

function compressImageCircle(file, size) {
  return processImageFile(file, image => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const context = canvas.getContext('2d');

    context.beginPath();
    context.arc(size / 2, size / 2, size / 2 - 3, 0, Math.PI * 2);
    context.closePath();
    context.clip();

    const cover = imageCoverSquare(image.width, image.height, size);
    context.drawImage(image, cover.x, cover.y, cover.width, cover.height);

    context.beginPath();
    context.arc(size / 2, size / 2, size / 2 - 3, 0, Math.PI * 2);
    context.lineWidth = 6;
    context.strokeStyle = '#e8c558';
    context.stroke();
    return canvas.toDataURL('image/png');
  });
}

function compressImage(file, maxDimension, quality) {
  const targetDimension = maxDimension || PHOTO_MAX_DIM;
  const initialQuality = quality || PHOTO_QUALITY;

  return processImageFile(file, image => {
    const dimensions = imageFitInside(image.width, image.height, targetDimension);
    const canvas = document.createElement('canvas');
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    canvas.getContext('2d').drawImage(image, 0, 0, dimensions.width, dimensions.height);

    let currentQuality = initialQuality;
    let data = canvas.toDataURL('image/jpeg', currentQuality);
    while (data.length > 950000 && currentQuality > 0.35) {
      currentQuality -= 0.12;
      data = canvas.toDataURL('image/jpeg', currentQuality);
    }
    return data;
  });
}
