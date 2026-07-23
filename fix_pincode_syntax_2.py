with open('server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    'vidhan_sabha:  Assembly Constituency,',
    'vidhan_sabha: office.District + " Assembly Constituency",'
)
content = content.replace(
    'sansad_kshetra:  Lok Sabha constituency,',
    'sansad_kshetra: office.District + " Lok Sabha constituency",'
)

with open('server.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print('Pincode endpoint syntax fixed')
