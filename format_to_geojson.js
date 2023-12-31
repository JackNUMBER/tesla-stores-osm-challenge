const fs = require('fs');
const path = require('path');
const { convert } = require('./format_hours');

const inputFilePath = path.join(__dirname, 'output/tesla_stores.json');
const outputFilePath = path.join(__dirname, 'output/tesla_stores.geojson');

function setName(name) {
  if (name.includes('Tesla')) return name;
  return `Tesla ${name}`;
}

function formatHours(hours) {
  let output = '';

  for (const [key, value] of Object.entries(hours)) {
    output += `${key}: ${value}, `;
  }

  return convert(output);
}

fs.readFile(inputFilePath, 'utf8', (error, data) => {
  if (error) {
    console.error(
      "Une erreur s'est produite lors de la lecture du fichier JSON :",
      error,
    );
    return;
  }

  try {
    const stores = JSON.parse(data);
    const geojsonFeatures = stores.map((store) => {
      const {
        name,
        commonName,
        address,
        extendedAddress,
        city,
        phone,
        email,
        storeType,
        hasRepearCenter,
        services,
        storeHours,
        serviceHours,
        coordinates,
      } = store;

      const feature = {
        type: 'Feature',
        properties: {
          name: setName(name),
          phone,
          email,
          address,
          extendedAddress,
          city,
          storeHours: formatHours(storeHours),
          serviceHours: formatHours(serviceHours),
          hasRepearCenter,
          storeType,
          services,
        },
        geometry: {
          type: 'Point',
          coordinates: [
            parseFloat(coordinates.longitude),
            parseFloat(coordinates.latitude),
          ],
        },
      };

      return feature;
    });

    const geojson = {
      type: 'FeatureCollection',
      name: 'Tesla Stores',
      features: geojsonFeatures,
    };

    const outputData = JSON.stringify(geojson, null, 2);

    fs.writeFile(outputFilePath, outputData, (error) => {
      if (error) {
        console.error(
          "Une erreur s'est produite lors de l'écriture du fichier GeoJSON :",
          error,
        );
      } else {
        console.log('\x1b[32m \n\n✔ Terminé\n\n \x1b[0m');
      }
    });
  } catch (error) {
    console.error(
      "Une erreur s'est produite lors de la transformation en GeoJSON :",
      error,
    );
  }
});
