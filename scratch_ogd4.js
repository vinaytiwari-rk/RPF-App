const key = '579b464db66ec23bdd00000190c6f32d55f843bf63331559161f2b1d';
fetch(`https://api.data.gov.in/catalog/v1?api-key=${key}&format=json&limit=100&offset=0`)
  .then(res => res.json())
  .then(data => {
    // Just fetch first 100, wait, OGD has a specific API to search. 
    console.log(data);
  })
  .catch(err => console.error(err));
