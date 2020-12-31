import requests
import json
from bs4 import BeautifulSoup

# Source for MI mail-in ballot counts
url = 'https://electproject.github.io/Early-Vote-2020G/MI.html'

r = requests.get(url)
html = r.text

soup = BeautifulSoup(html, "html.parser")

date = soup.p.contents[0][-10:]

results = soup.findAll('script', {'type':'application/json'})
results = results[1].contents[0]
results = json.loads(results)

raw_data = results['x']['data']
counties = raw_data[0]
requested_ballot_count = raw_data[1]
accepted_ballot_count = raw_data[2]

ballots_by_county = {}

for i in range(len(counties)):
    ballot_dict = {
        'req': requested_ballot_count[i],
        'acc': accepted_ballot_count[i]
    }

    ballots_by_county[counties[i]] = ballot_dict

lastdict = {
    'date': date,
    'counties': ballots_by_county
}

# Now get overall US data
url = "https://electproject.github.io/Early-Vote-2020G/index.html"

r = requests.get(url)
html = r.text

soup = BeautifulSoup(html, "html.parser")

us_totals = soup.find("h3").findNext().text.replace(",", "").split(" • ")
date = soup.find("p").text

usdict = {
    'date': date,
    'earlyVotes': int(us_totals[0].split(": ")[1]),
    'mailVotes': int(us_totals[1].split(": ")[1]),
    'personVotes': int(us_totals[2].split(": ")[1])
}

finaldict = {
    'us': usdict,
    'mi': lastdict
}

print(json.dumps(finaldict))
