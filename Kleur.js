class Kleur {
  luminance(arr) {
    var a = [arr[0], arr[1], arr[2]].map(function(v) {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });

    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  }

  contrast(rgb1, rgb2) {
    var lum1 = luminance(rgb1);
    var lum2 = luminance(rgb2);
    var brightest = Math.max(lum1, lum2);
    var darkest = Math.min(lum1, lum2);
    result = (brightest + 0.05) / (darkest + 0.05);
    if (result < 1) result = 1 / result;
    return result;
  }

  rgb_xyz(r) {
    if ((r /= 255) <= 0.04045) {
      return r / 12.92;
    }
    return Math.pow((r + 0.055) / 1.055, 2.4);
  }

  xyz_lab(t) {
    if (t > 0.008856452) {
      return Math.pow(t, 1 / 3);
    }
    return t / 0.12841855 + 0.12841855;
  }

  lab_xyz(t) {
    return t > 0.206896552 ? t * t * t : 0.12841855 * (t - 0.12841855);
  }

  rgb_to_xyz(arr) {
    let r = arr[0];
    let g = arr[1];
    let b = arr[2];
    r = this.rgb_xyz(r);
    g = this.rgb_xyz(g);
    b = this.rgb_xyz(b);
    let x = this.xyz_lab(
      (0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / 0.95047
    );
    let y = this.xyz_lab((0.2126729 * r + 0.7151522 * g + 0.072175 * b) / 1);
    let z = this.xyz_lab(
      (0.0193339 * r + 0.119192 * g + 0.9503041 * b) / 1.08883
    );
    return [Number(x.toFixed(4)), Number(y.toFixed(4)), Number(z.toFixed(4))];
  }

  lab_to_lch(arr) {
    const RAD2DEG = 180 / 3.14;
    var l = arr[0];
    var a = arr[1];
    var b = arr[2];
    var c = Math.sqrt(a * a + b * b);
    var h = (Math.atan2(b, a) * RAD2DEG + 360) % 360;
    if (Math.round(c * 10000) === 0) {
      h = Number.NaN;
    }
    return [Math.round(l), Math.round(c), Math.round(h)];
  }

  rgb_to_lab(arr) {
    // taken from chroma.js   https://github.com/gka/chroma.js/blob/master/chroma.js
    let x = arr[0];
    let y = arr[1];
    let z = arr[2];
    let l = Math.round(116 * y - 16);
    return [
      l < 0 ? 0 : l,
      Math.round(500 * (x - y)),
      Math.round(200 * (y - z))
    ];
  }

  difference(lab1, lab2) {
    Delta = Math.sqrt(
      (lab1[0] - lab2[0]) ** 2 + (lab1[1] - lab2[1]) ** 2 + (lab1[2] - lab2[2])
    );
    return Delta / 100;
  }
  // this converts our values to HEX codes
  componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }

  hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ];
  }

  // this adds up the values of r g and b and returns the complete HEX code
  rgbToHex(r, g, b) {
    return (
      "#" +
      this.componentToHex(r) +
      this.componentToHex(g) +
      this.componentToHex(b)
    );
  }

  // Groups the map by the HEX codes
  groupBy(list, keyGetter) {
    const map = new Map();
    list.forEach(item => {
      const key = keyGetter(item);
      const collection = map.get(key);
      if (!collection) {
        map.set(key, [item]);
      } else {
        collection.push(item);
      }
    });
    return map;
  }

  // RGB to hsv
  rgb_to_hsv(arr) {
    let rr = arr[0] / 255; // 0.39
    let rg = arr[1] / 255; // 0.39
    let rb = arr[2] / 255; // 0.39

    let max = Math.max(rr, rg, rb);
    let min = Math.min(rr, rg, rb);

    if (arr[0] == arr[1] && arr[1]== arr[2] &&  arr[2]== arr[0]) {
      return [0, 0, Math.round(max * 100)];
    }

    let delta = max - min;

    let h;

    if (rr === max) {
      h = (rg - rb) / delta;
    } else if (rg === max) {
      h = 2.0 + (rb - rr) / delta;
    } else if (rb === max) {
      h = 4.0 + (rr - rg) / delta;
    } else {
      console.log("wrong");
    }

    h *= 60;
    if (h < 0) {
      h += 360;
    }

    return [
      Math.round(h),
      Math.round((delta / max) * 100),
      Math.round(max * 100)
    ];
  }

  setup(x, img_obj) {
    x.canvas.width = img_obj.width;
    x.canvas.height = img_obj.height;
    x.drawImage(imageObj, 0, 0, img_obj.width, img_obj.height);
    var imgData = x.getImageData(0, 0, canvas.width, canvas.height);
    var data = imgData.data;
    return data;
  }

  generateColorArray(color_arr) {
    let pixelData = [];
    // put rgb, hex and hsv data of each pixel in pixelData Array
    for (var i = 0; i < color_arr.length; i += 4) {
      // Initialize empty object
      let temp = {};

      // getting (r g b a) the value for each pixel
      // (r g b a) values of a pixel are set one after other in array, [so we +1 +2 +3]

      // getting values for (r g b a)
      var red = color_arr[i]; // Storing Value of Red
      var green = color_arr[i + 1]; // Storing Value of Green
      var blue = color_arr[i + 2]; // Storing Value of Blue
      var alpha = color_arr[i + 3]; // Storing Value of Alpha (opacity)

      // Creating the object
      // temp["rgba"] = [red, green, blue, alpha];
      temp["hex"] = this.rgbToHex(red, green, blue); // converting the rgb to hex
      // temp["hsv"] = rgb_to_hsv(red, green, blue);
      // pushing object to pixelData Array
      pixelData.push(temp);
    }

    // pixelData.forEach();

    // Grouping the object based on pixels hex value
    const grouped = this.groupBy(pixelData, pixel => pixel.hex);

    // setting values of hex code to the number of pixels that have their hex code
    // hex code = no. of pixel that have that hex code
    grouped.forEach(function(value, key) {
      grouped.set(key, value.length);
    });
    grouped.forEach(elem => {
      if (elem.count < (imageObj.height * imageObj.width) / 100) {
        grouped.pop(elem);
      }
    });
    // sort the map according the no. hex of pixels
    // for e.g. if black has the most pixels then it will be first
    const mapSort1 = new Map(
      [...grouped.entries()].sort((a, b) => b[1] - a[1])
    );

    let mainPixelsList = [],
      key,
      value;
    for ([key, value] of mapSort1.entries()) {
      let rgb = this.hexToRgb(key);
      let temp = {};
      temp["hex"] = key;
      temp["rgb"] = rgb;
      temp["hsv"] = this.rgb_to_hsv(rgb);
      temp["xyz"] = this.rgb_to_xyz(rgb);
      temp["lab"] = this.rgb_to_lab(temp["xyz"]);
      temp["lch"] = this.lab_to_lch(temp["lab"]);
      // temp["luminance"] = luminance(temp["rgb"]);
      temp["count"] = value;
      mainPixelsList.push(temp);
    }

    return mainPixelsList;
  }

  getSwatch(color_arr) {
    let colors = [];
    for (i = 0; i < color_arr.length; i++) {
      if (Math.abs(color_arr[i].lab[1] - color_arr[i].lab[2]) > 20) {
        light.push(color_arr[i]);
      }
    }
    return colors;
  }

  getRandomSwatch(color_arr) {
    let rand = [];
    for (let i = 0; i < 20; i++) {
      let ra = color_arr[Math.floor(Math.random() * color_arr.length)];
      rand.push(ra);
    }
    rand.sort((a, b) => parseFloat(a.count) - parseFloat(b.count));
    return rand;
  }

  getLightColors(swatch) {
    let light = [];
    swatch.forEach(elem => {
      if (elem.lab[0] > 60) {
        light.push(elem);
      }
    });
    return light;
  }

  getDarkColors(swatch) {
    let dark = [];
    swatch.forEach(elem => {
      if (elem.lab[0] < 60) {
        dark.push(elem);
      }
    });
    return dark;
  }

  getDominant(color_arr) {
    return color_arr[0];
  }

  makeDarker(hex) {
    let rgb = this.hexToRgb(hex);
    let newHex = this.rgbToHex(
      Math.round(rgb[0] / 4),
      Math.round(rgb[1] / 4),
      Math.round(rgb[2] / 4)
    );
    return newHex;
  }

  getVIbrant(color_arr, range = 30) {
    let vib = [];
    for (let i = 0; i < color_arr.length; i++) {
      if (Math.abs(color_arr[i].lab[1] - color_arr[i].lab[2]) > range) {
        vib.push(color_arr[i]);
      }
    }
    return vib;
  }
}
