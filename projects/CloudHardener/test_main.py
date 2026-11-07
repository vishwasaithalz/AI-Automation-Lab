import unittest
from main import inspect,audit
class Tests(unittest.TestCase):
 def test_insecure(self):
  obj={"kind":"Pod","spec":{"containers":[{"name":"app","securityContext":{"privileged":True}}]}}
  findings=inspect(obj)["findings"]
  self.assertIn("app:privileged",findings)
  self.assertIn("app:writable_root",findings)
 def test_hardened(self):
  c={"name":"app","securityContext":{"allowPrivilegeEscalation":False,"readOnlyRootFilesystem":True,"runAsNonRoot":True}}
  self.assertEqual(inspect({"kind":"Pod","spec":{"containers":[c]}})["findings"],[])
 def test_no_secret_leak(self):
  result=inspect({"kind":"Secret","stringData":{"password":"topsecret"}})
  self.assertNotIn("topsecret",str(result))
  self.assertIn("plaintext_stringData_present",result["findings"])
 def test_list(self):
  self.assertEqual(len(audit({"kind":"List","items":[{"kind":"Ingress"},{"kind":"ConfigMap"}]})),2)
if __name__=="__main__":unittest.main()
