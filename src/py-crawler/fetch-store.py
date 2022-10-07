import requests

url = 'https://script.google.com/macros/s/AKfycbydJ9ELChSr5QL6CNCrI9g3N3RqH8lV2-ie-GLQfrE7U_qx1HifIEF07O1Del2NFNqavw/exec'
resp = requests.get(url)

print(resp.text)