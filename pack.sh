#!/bin/bash

cp README.md ./build
cp CHANGELOG.md ./build
cp LICENSE ./build

tar -zcf release.tar.gz build/
zip -rq release.zip build/