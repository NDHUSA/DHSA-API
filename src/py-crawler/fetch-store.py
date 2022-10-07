import requests

url = 'https://script.google.com/macros/s/AKfycby8dyw15iic-IXwqGwrQLXcWU-VFNilJz5Qrw4lNQ62vPsdeyOiiL7ei6gEw-PqZ-RcvA/exec'
resp = requests.get(url)

print(resp.text)