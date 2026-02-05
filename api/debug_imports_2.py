import sys
try:
    import pymongo
    print(f"PyMongo version: {pymongo.version}")
    
    # Try to simulate the check done by Flask-PyMongo
    if hasattr(pymongo, 'version_tuple'):
        print(f"PyMongo version_tuple: {pymongo.version_tuple}")
        if pymongo.version_tuple < (4, 3):
             print("Check failed: version_tuple < (4, 3)")
        else:
             print("Check passed: version_tuple >= (4, 3)")
    else:
        print("PyMongo has no version_tuple")

except ImportError:
    print("PyMongo not found")
