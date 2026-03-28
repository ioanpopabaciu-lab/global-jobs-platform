import time, os, subprocess
print("Waiting for translated_blogs.json...")
while not os.path.exists("translated_blogs.json"):
    time.sleep(2)
print("Translating completed! Running injection...")
subprocess.run(["python", "inject_blogs.py"])
