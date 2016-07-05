commute-sync
============


Docker build
------------

```
    docker build -t commute-sync .
```


Docker run
----------

```
     docker run -e "CITY=<City>" -e "API_KEY=<API_KEY>" -e "DB_HOST=<DB_HOST>" --rm --name commute-sync commute-sync
```


Docker run into Bash
--------------------

```
     docker run -e "CITY=<City>" -e "API_KEY=<API_KEY>" -e "DB_HOST=<DB_HOST>" --rm -it --name commute-sync commute-sync bash
```

Docker logs
-----------

```
    docker logs commute-sync
```