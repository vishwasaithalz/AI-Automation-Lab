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

 def test_transfer_budget_deterministic(self):
  from main import transfer_budget
  data="repeat and compress "*200
  first=transfer_budget(data);second=transfer_budget(data)
  self.assertEqual(first,second)
  self.assertGreater(first["bytes_saved"],0)
  self.assertEqual(first["source"],"local_gzip_estimate")
  with self.assertRaises(TypeError):transfer_budget(b"binary")

if __name__=="__main__":unittest.main()
