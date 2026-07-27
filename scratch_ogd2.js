const key = '579b464db66ec23bdd00000190c6f32d55f843bf63331559161f2b1d';
fetch(`https://api.data.gov.in/catalog/v1?api-key=${key}&format=json&limit=100`)
  .then(res => res.json())
  .then(data => {
    const matched = data.records.filter(r => r.title.toLowerCase().includes('women helpline') || r.title.toLowerCase().includes('assisted through'));
    console.log(JSON.stringify(matched, null, 2));
  })
  .catch(err => console.error(err));
