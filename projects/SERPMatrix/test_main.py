import unittest
from main import audit,sitemap
class Tests(unittest.TestCase):
 def test_missing(self):
  r=audit("<html><img src='a'></html>")
  self.assertIn("missing_title",r["issues"])
  self.assertIn("images_without_dimensions",r["issues"])
 def test_complete(self):
  html='<title>Hi</title><meta name="description" content="x"><meta name="viewport" content="width=device-width"><link rel="canonical" href="https://x.org/"><img width="2" height="2" src="a">'
  self.assertEqual(audit(html)["issues"],[])
 def test_sitemap(self):
  self.assertIn("&amp;",sitemap(["https://example.org/?a=1&b=2"]))
  with self.assertRaises(ValueError):sitemap(["http://example.org"])
if __name__=="__main__":unittest.main()
