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

 def test_extended_structure(self):
  from main import audit_extended
  result=audit_extended('<h1>Article</h1><img src="x"><a>Unlinked</a>')
  self.assertEqual(result["h1_count"],1)
  self.assertEqual(result["images_without_alt"],1)
  self.assertEqual(result["links_without_href"],1)
  self.assertIn("images_without_alt",result["warnings"])
  self.assertIn("missing_title",result["issues"])
  self.assertNotIn("missing_h1",result["warnings"])

if __name__=="__main__":unittest.main()
