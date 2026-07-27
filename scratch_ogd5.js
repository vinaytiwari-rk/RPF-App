const key = '579b464db66ec23bdd00000190c6f32d55f843bf63331559161f2b1d';
fetch(`https://api.data.gov.in/catalog/v1?api-key=${key}&format=json&limit=50&orgType=Ministry&orgName=Ministry of Women and Child Development`)
  .then(res => res.json())
  .then(data => {
    console.log(JSON.stringify(data.records?.map(r => ({title: r.title, id: r.index_name})), null, 2));
  })
  .catch(err => console.error(err));
