import requests
import os

url = os.environ['GASAPI_PAYING_MEMBER']
resp = requests.get(url)

print(resp.text)