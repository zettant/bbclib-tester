bbc1 transaction tester
=======

Cross tester for transactions created by py-bbclib and bbclib-go.

# Preparation
```
cd python
python3 -mvenv venv
. venv/bin/activate
pip install -r requirements.txt
```

# Test
```
cd python
. venv/bin/activate
python transaction_creator.py
```

40 transactions are generated and stored in db/txdb.sqlite.

Then, you can read the transactions with python or golang tool as follows:

```
cd python
. venv/bin/activate
python transaction_reader.py
```

```
cd golang
./transaction_reader
```

If there are any inconsistency, the programs will terminated by assersion.
