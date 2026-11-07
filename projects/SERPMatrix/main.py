"""SERPMatrix: offline HTML SEO inspector and sitemap generator."""
import json
import argparse
from html.parser import HTMLParser
from urllib.parse import urlparse
from xml.etree.ElementTree import Element,SubElement,tostring

class Reader(HTMLParser):
 def __init__(self):
  super().__init__(convert_charrefs=True)
  self.title=""; self.in_title=False; self.in_ld=False; self.ld=[]
  self.description=None; self.canonical=None; self.viewport=None; self.robots=None
  self.images=0; self.missing_dimensions=0
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=="title": self.in_title=True
  if tag=="meta":
   name=(a.get("name") or "").lower()
   if name in ("description","viewport","robots"): setattr(self,name,a.get("content",""))
  if tag=="link" and "canonical" in (a.get("rel") or "").lower().split(): self.canonical=a.get("href")
  if tag=="img":
   self.images+=1
   if not a.get("width") or not a.get("height"): self.missing_dimensions+=1
  if tag=="script" and (a.get("type") or "").lower()=="application/ld+json": self.in_ld=True
 def handle_endtag(self,tag):
  if tag=="title": self.in_title=False
  if tag=="script": self.in_ld=False
 def handle_data(self,text):
  if self.in_title: self.title+=text
  if self.in_ld:self.ld.append(text)

def audit(html):
 r=Reader();r.feed(html);issues=[]
 for label,found in (("title",r.title.strip()),("description",r.description),
                     ("canonical",r.canonical),("viewport",r.viewport)):
  if not found:issues.append("missing_"+label)
 if r.missing_dimensions:issues.append("images_without_dimensions")
 if r.ld:
  try: json.loads("".join(r.ld))
  except ValueError:issues.append("invalid_jsonld")
 return {"title":r.title.strip(),"canonical":r.canonical,"robots":r.robots,
         "images":r.images,"images_without_dimensions":r.missing_dimensions,"issues":issues}

def sitemap(urls):
 root=Element("urlset",xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")
 for url in urls:
  u=urlparse(url)
  if u.scheme!="https" or not u.hostname or u.username or u.password:raise ValueError("HTTPS URLs only")
  SubElement(SubElement(root,"url"),"loc").text=url
 return '<?xml version="1.0" encoding="UTF-8"?>\n'+tostring(root,encoding="unicode")

if __name__=="__main__":
 p=argparse.ArgumentParser();p.add_argument("html_file");a=p.parse_args()
 with open(a.html_file,encoding="utf-8") as f:print(json.dumps(audit(f.read()),indent=2))
