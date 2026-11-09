"""CloudHardener: offline, read-only Kubernetes JSON manifest checks."""
import argparse
import json
WORKLOADS={"Pod","Deployment","DaemonSet","StatefulSet","Job","CronJob"}

def pod_spec(r):
 kind=r.get("kind"); spec=r.get("spec") or {}
 if kind=="Pod":return spec
 if kind=="CronJob":
  return ((((spec.get("jobTemplate") or {}).get("spec") or {}).get("template") or {}).get("spec") or {})
 return ((spec.get("template") or {}).get("spec") or {})

def inspect(r):
 if not isinstance(r,dict):raise TypeError("Kubernetes JSON resource expected")
 kind=r.get("kind","Unknown"); name=(r.get("metadata") or {}).get("name","unnamed"); findings=[]
 if kind in WORKLOADS:
  pod=pod_spec(r);pc=pod.get("securityContext") or {}
  for c in list(pod.get("containers") or [])+list(pod.get("initContainers") or []):
   cname=c.get("name","unnamed");sc=c.get("securityContext") or {}
   if sc.get("privileged") is True:findings.append(cname+":privileged")
   if sc.get("allowPrivilegeEscalation") is not False:findings.append(cname+":escalation_not_disabled")
   if sc.get("readOnlyRootFilesystem") is not True:findings.append(cname+":writable_root")
   if not (sc.get("runAsNonRoot") is True or pc.get("runAsNonRoot") is True):
    findings.append(cname+":non_root_not_required")
 if kind=="Ingress":
  s=r.get("spec") or {}
  if not s.get("tls"):findings.append("tls_not_declared")
  if any(not rule.get("host") for rule in s.get("rules") or []):findings.append("host_unspecified")
 if kind=="Secret" and r.get("stringData"):findings.append("plaintext_stringData_present")
 return {"kind":kind,"name":name,"findings":findings}

def audit(data):
 if isinstance(data,list):items=data
 elif isinstance(data,dict) and data.get("kind")=="List":items=data.get("items") or []
 elif isinstance(data,dict):items=[data]
 else:raise TypeError("Expected JSON resource or list")
 return [inspect(item) for item in items]


def inspect_advanced(resource):
 """Opt-in defensive policy review with no cluster access or manifest mutation."""
 base=inspect(resource);additional=[]
 kind=resource.get("kind")
 if kind in WORKLOADS:
  pod=pod_spec(resource)
  for flag in ("hostNetwork","hostPID","hostIPC"):
   if pod.get(flag) is True:additional.append("pod:"+flag+"_enabled")
  for c in list(pod.get("containers") or [])+list(pod.get("initContainers") or []):
   cname=c.get("name","unnamed")
   adds=((c.get("securityContext") or {}).get("capabilities") or {}).get("add") or []
   if "SYS_ADMIN" in adds or "ALL" in adds:additional.append(cname+":high_risk_capability")
   limits=(c.get("resources") or {}).get("limits") or {}
   if "cpu" not in limits or "memory" not in limits:additional.append(cname+":missing_resource_limits")
 return {**base,"findings":base["findings"]+additional,"advanced":True}

if __name__=="__main__":
 p=argparse.ArgumentParser();p.add_argument("json_manifest");a=p.parse_args()
 with open(a.json_manifest,encoding="utf-8") as f:print(json.dumps(audit(json.load(f)),indent=2))
