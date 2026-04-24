# COMFY-TYPE-TEST

## Purpose
To run typescript type checks but keep a log of errors so only new ones are paid attention to. Stores errors in an comfy_accept.yaml

## Method
The library will use:
- tsc package and API
- sqlite and 64 bit encoding for the files.
- simple calls to the "check type" api which saves results to a sqlite table, 
then compares with the previous results and reports diff. Judge is separate.
