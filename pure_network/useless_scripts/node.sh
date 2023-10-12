#!/usr/bin/env bash

c=0
identity=""
orderer="false"

for var in "$@"; do
    if [[ "--device" == "${var}" || "-d" == "${var}"  ]]; then
        c=$((c+1))
    fi
    if [[ "--as" == "${var}" || "-a" == "${var}" ]]; then
        c=$((c+1))
    fi

    if [[ "--nc" == "${var}" || "-n" == "${var}" ]]; then
        c=$((c+1))
    fi
    
    if [[ "--orderer" == "${var}" || "-o" == "${var}" ]]; then
        orderer=
    fi
done

if [[ !${c} != 1 ]]