# Concept

Pets.local is the hottest startup yet to come out of Hong Kong.

They provide a soft real-time, location-based matching service for Customers who are looking to find a new Pet.

## Your Task

Build a basic system for matching Pets and Customers

## Entities

### Pet

A pet, looking for a new home.

Properties

* id - integer
* name - string
* available_from - timestamp
* age - integer
* species - string
  * cat
  * dog
  * rabbit
* breed - string (for a dog)
  * labrador
  * poodle
  * spaniel
  * terrier

### Customer

People looking for pets

* id - integer
* preference - *CustomerPreference

### Customer Preference

A description of a customer's preference for a pet

They could be very permissive "anything will do",
or be very restricitive "only poodles aged < 2"

* age - a range
* species - a list of species they'd accept
* breed - if they accept dogs, they can select a list of breeds they'd accept

## API

### POST /pets

Add a new pet to the system, with all the properties described above

### GET /pets/{id}

Fetch the pet by ID

### GET /pets/{id}/matches (TODO)

Get an array of "matching" customers for the given pet

### POST /customers

Add a new customer to the system

Together with their preferences for pets

### GET /customers/{id}

Fetch the customer by ID

### GET /customers/{id}/matches

Get an array of "matching" Pets for the given customer

### POST /customers/{id}/adopt?pet_id={pet_id} (TODO)

The Customer adopts the given Pet

The Pet and Customer should no longer appear in `/matches` queries