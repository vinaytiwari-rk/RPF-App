const key = '579b464db66ec23bdd00000190c6f32d55f843bf63331559161f2b1d';
fetch(`https://api.data.gov.in/catalog/v1?api-key=${key}&format=json&title=Women Helpline`)
  .then(res => res.json())
  .then(data => {
    console.log("Total matched:", data.total);
    console.log(JSON.stringify(data.records, null, 2));
  })
  .catch(err => console.error(err));
