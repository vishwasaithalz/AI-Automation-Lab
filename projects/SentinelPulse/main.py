"""SentinelPulse: bounded signature demo and local rate limiting. Not a production WAF."""
import re
import json
import secrets
import argparse
from collections import defaultdict, deque
from time import monotonic

RULES = {
 "script_tag": re.compile(r"<\s*script\b", re.I),
 "traversal": re.compile(r"(?:\.\./|\.\.\\)"),
 "sql_union": re.compile(r"\bunion\s+select\b", re.I),
}

class SlidingWindow:
 def __init__(self, limit=5, window=60):
  if limit < 1 or window <= 0: raise ValueError("Invalid limit/window")
  self.limit, self.window, self.events = limit, window, defaultdict(deque)

 def allow(self, client, now=None):
  now = monotonic() if now is None else float(now)
  events = self.events[client]
  while events and events[0] <= now-self.window: events.popleft()
  if len(events) >= self.limit: return False
  events.append(now)
  return True

def inspect(path, body="", limiter=None, client="demo", now=None):
 if not isinstance(path,str) or not isinstance(body,str): raise TypeError("Strings required")
 text=path+"\n"+body
 if len(text)>8192: return {"allowed":False,"reason":"size_limit"}
 if limiter and not limiter.allow(client,now): return {"allowed":False,"reason":"rate_limited"}
 for name,pattern in RULES.items():
  if pattern.search(text): return {"allowed":False,"reason":name}
 return {"allowed":True,"reason":"no_demo_rule_matched"}

def example_csp():
 nonce=secrets.token_urlsafe(18)
 return {"Content-Security-Policy":"default-src 'self'; object-src 'none'; script-src 'self' 'nonce-"+nonce+"'"}, nonce


def inspect_batch(records, limiter=None, now=None):
 """Process up to 100 synthetic or authorized records without echoing request content."""
 if not isinstance(records,list) or len(records)>100:
  raise ValueError("Expected at most 100 records")
 results=[]; summary={}
 for item in records:
  if not isinstance(item,dict):raise TypeError("Each record must be an object")
  result=inspect(item.get("path",""),item.get("body",""),limiter,item.get("client","demo"),now)
  results.append(result)
  reason=result["reason"];summary[reason]=summary.get(reason,0)+1
 return {"total":len(results),"allowed":sum(x["allowed"] for x in results),"by_reason":summary,"results":results}

if __name__=="__main__":
 ap=argparse.ArgumentParser()
 ap.add_argument("--path",default="/login")
 ap.add_argument("--body",default="")
 a=ap.parse_args()
 print(json.dumps(inspect(a.path,a.body),indent=2))
