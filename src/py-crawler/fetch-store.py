import requests

url = 'https://script.google.com/macros/s/AKfycbxGzZWP_KXGruKOJKlnBwv39n9C1P0tGeTyZLvH-WaghTU6mGWiQF9I6md15e9j3Ru6CA/exec'
resp = requests.get(url)

print(resp.text)