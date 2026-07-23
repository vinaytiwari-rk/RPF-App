import re

with open('src/pages/ServiceDetails.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Instead of setError, just setContentData(null) for non-200 responses
content = content.replace('setError(isHi ? "सर्विस लोड नहीं हो सकी।" : "Failed to load content.");', 'setContentData(null);')
content = content.replace('setError(isHi ? "नेटवर्क समस्या।" : "Network error.");', 'setContentData(null);')

with open('src/pages/ServiceDetails.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Fixed ServiceDetails.tsx')
