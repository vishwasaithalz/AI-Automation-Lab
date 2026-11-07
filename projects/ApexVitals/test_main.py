import gzip
import tempfile
import unittest
from pathlib import Path
from main import analyze,srcset_plan,compress
class Tests(unittest.TestCase):
 def test_glyphs(self):
  r=analyze('<p>Hello</p><script>SECRET</script><img alt="cat" src="x">')
  self.assertNotIn("S",r["glyphs"])
  self.assertIn("c",r["glyphs"])
  self.assertEqual(r["images_missing_size"],1)
 def test_plan(self):
  self.assertEqual(srcset_plan("hero",(640,320,640)),"hero-320.avif 320w, hero-640.avif 640w")
 def test_gzip(self):
  with tempfile.TemporaryDirectory() as d:
   f=Path(d)/"page.html";f.write_bytes(b"abc")
   created=compress(f)
   self.assertIn(str(f)+".gz",created)
   with gzip.open(str(f)+".gz","rb") as handle:self.assertEqual(handle.read(),b"abc")
if __name__=="__main__":unittest.main()
