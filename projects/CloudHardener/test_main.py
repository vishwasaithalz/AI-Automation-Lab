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

 def test_opt_in_advanced_policy(self):
  from main import inspect_advanced
  pod={"kind":"Pod","spec":{"hostNetwork":True,"containers":[{"name":"api","securityContext":{
    "runAsNonRoot":True,"allowPrivilegeEscalation":False,"readOnlyRootFilesystem":True,
    "capabilities":{"add":["SYS_ADMIN"]}}}]}}
  result=inspect_advanced(pod)
  self.assertIn("pod:hostNetwork_enabled",result["findings"])
  self.assertIn("api:high_risk_capability",result["findings"])
  self.assertIn("api:missing_resource_limits",result["findings"])
  self.assertEqual(inspect(pod)["findings"],[])

if __name__=="__main__":unittest.main()
