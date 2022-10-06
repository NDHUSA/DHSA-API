import requests

url = 'https://script.google.com/macros/s/AKfycbxwfVUAaUmpj2Sh7ldxGknQwSHlGETEfUS0GvCgPfeTJ2g4IMLFz4DLfHnQqN5C0TNkVg/exec'
resp = requests.get(url)

print(resp.text)