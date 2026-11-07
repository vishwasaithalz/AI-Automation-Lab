import unittest
from main import SlidingWindow,inspect,example_csp
class Tests(unittest.TestCase):
 def test_rate_window(self):
  w=SlidingWindow(limit=2,window=10)
  self.assertTrue(w.allow("a",0)); self.assertTrue(w.allow("a",1))
  self.assertFalse(w.allow("a",2)); self.assertTrue(w.allow("a",10))
  self.assertTrue(w.allow("b",2))
 def test_signatures(self):
  self.assertEqual(inspect("/../secret")["reason"],"traversal")
  self.assertEqual(inspect("/", "<script>")["reason"],"script_tag")
  self.assertEqual(inspect("/","a"*9000)["reason"],"size_limit")
  self.assertTrue(inspect("/healthy")["allowed"])
 def test_unique_nonce(self):
  h,n=example_csp()
  self.assertIn("nonce-"+n,h["Content-Security-Policy"])
  self.assertNotEqual(n,example_csp()[1])
if __name__=="__main__":unittest.main()
