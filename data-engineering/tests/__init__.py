import logging

# keep pipeline log output out of the test run (the logging test configures its own handler)
logging.getLogger("etl").addHandler(logging.NullHandler())
logging.getLogger("etl").propagate = False
