/*
  New version just uses the plan names.
  Hopefully storage will never be maxxed!

  I used:
  https://en.wikipedia.org/wiki/List_of_vegetables
  https://en.wikipedia.org/wiki/List_of_culinary_fruits
  https://en.wikipedia.org/wiki/List_of_culinary_herbs_and_spices
  then removed uncommon Items
  
  Users can add more plants as they need.
*/



var plantsList = [
  [0, 'Coffee']
, [1, 'Cacao (Chocolate)']
, [2, 'Hazelnut']
, [3, 'Nectarine']
, [4, 'Sweet potato']
, [5, 'Beetroot']
, [6, 'Parsnip']
, [7, 'Wheat']
, [8, 'Onion']
, [9, 'Peppercorn']
, [10, 'Carrot']
, [11, 'Cauliflower']
, [12, 'Brussels sprout']
, [13, 'Potato']
, [14, 'Plum']
, [15, 'Spinach']
, [16, 'Pistachio']
, [17, 'Chard']
, [18, 'Kale']
, [19, 'Oats']
, [21, 'Flax']
, [22, 'Clementine']
, [23, 'Grape']
, [24, 'Banana']
, [25, 'Swede']
, [26, 'Radish']
, [27, 'Strawberry']
, [28, 'Apple']
, [29, 'Mushrooms']
, [30, 'Tomato']
, [31, 'Green bean']
, [32, 'Garden Pea']
, [33, 'Cucumber']
, [34, 'Orange']
, [35, 'Tea']
, [36, 'Brazil nut']
, [37, 'Lettuce']
, [38, 'Haricot bean']
, [39, 'Butter bean']
, [40, 'Cabbage']
, [41, 'Sweetcorn']
, [42, 'Popcorn']
, [43, 'Cashew']
, [44, 'Peanut']
, [45, 'Peach']
, [46, 'Basil']
, [47, 'Oregano']
, [48, 'Rosemary']
, [49, 'Thyme']
, [50, 'Bay leaf']
, [51, 'Parsley']
, [52, 'Coriander']
];



var plantList = [
 'Allspice'
, 'Almond'
, 'Anise'
, 'Aniseed'
, 'Apple'
, 'Apricot'
, 'Artichoke'
, 'Asparagus'
, 'Aubergine'
, 'Avocado'
, 'Bamboo shoot'
, 'Banana'
, 'Barley'
, 'Basil'
, 'Bay leaf'
, 'Beetroot'
, 'Bell pepper'
, 'Black-eyed pea'
, 'Blackberry'
, 'Blueberry'
, 'Bok Choy'
, 'Brazil nut'  
, 'Broccoli'
, 'Brussels sprout'
, 'Burdock'
, 'Butter bean'
, 'Cabbage'
, 'Cacao (Chocolate)'
, 'Cantaloupe'
, 'Caper'
, 'Caraway'
, 'Cardamom'
, 'Carrot'
, 'Cashew nut'
, 'Cassava'
, 'Cauliflower'
, 'Cayenne pepper'
, 'Celeriac'
, 'Celery'
, 'Cherry'
, 'Chestnut'
, 'Chard'
, 'Chia'
, 'Chickpea'
, 'Chicory'
, 'Chili pepper'
, 'Chives'
, 'Cinnamon'
, 'Clementine'
, 'Clove'
, 'Coconut'
, 'Coffee'
, 'Collard'
, 'Coriander'
, 'Corn/Maize'
, 'Cranberry'
, 'Cress'
, 'Cucumber'
, 'Cumin'
, 'Curry leaf'
, 'Date'
, 'Dill'
, 'Elderberry'
, 'Elderflower'
, 'Fava bean'
, 'Fennel'
, 'Fenugreek'
, 'Fig'
, 'Flax'
, 'Fluted pumpkin'
, 'French bean'
, 'Gala melon'
, 'Garden Pea'
, 'Garlic'
, 'Ginger'
, 'Gooseberry'
, 'Grape'
, 'Grapefruit'
, 'Guava'
, 'Haricot bean'
, 'Hazelnut'
, 'Heart of palm'
, 'Hemp seed'
, 'Honeydew melon'
, 'Horseradish'
, 'Huckleberry'
, 'Jalapeño'
, 'Juniper berry'
, 'Kale'
, 'Kidney bean'
, 'Kiwifruit'
, 'Kumquat'
, 'Lamb&apos;s lettuce'
, 'Lavender'
, 'Leek'
, 'Lemon'
, 'Lemongrass'
, 'Lentil'
, 'Lettuce'
, 'Licorice'
, 'Lime'
, 'Locust bean'
, 'Loganberry'
, 'Mace'
, 'Mandarin orange'
, 'Mangetout'
, 'Mango'
, 'Marjoram'
, 'Mint'
, 'Mushrooms'
, 'Mustard'
, 'Nectarine'
, 'Nutmeg'
, 'Oats'
, 'Okra'
, 'Olive'
, 'Onion'
, 'Orange'
, 'Oregano'
, 'Papaya'
, 'Paprika'
, 'Parsley'
, 'Parsnip'
, 'Passionfruit'
, 'Peach'
, 'Peanut'
, 'Pear'
, 'Peppercorn'
, 'Peppermint'
, 'Petite Pois'
, 'Pineapple'
, 'Pinto bean'
, 'Pistachio'
, 'Plantain'
, 'Plum'
, 'Poke'
, 'Pomegranate'
, 'Popcorn'
, 'Poppy seed'
, 'Potato'
, 'Prune'
, 'Pumpkin'
, 'Radish'
, 'Raspberry'
, 'Rhubarb'
, 'Rice'
, 'Rocket'
, 'Rose hip'
, 'Rosemary'
, 'Runner bean'
, 'Saffron'
, 'Sage'
, 'Sassafras'
, 'Satsuma mandarin'
, 'Sesame Seed'
, 'Shallot'
, 'Sloe'
, 'Sorrel'
, 'Soybean'
, 'Spearmint'
, 'Spinach'
, 'Spring onion / Scallion'
, 'Squash'
, 'Star fruit'
, 'Strawberry'
, 'Sugarsnap'
, 'Sunflower seed'
, 'Swede'
, 'Sweetcorn'
, 'Sweet potato'
, 'Swiss chard'
, 'Tangerine'
, 'Tarragon'
, 'Tea'
, 'Thyme'
, 'Tomato'
, 'Turmeric'
, 'Turnip'
, 'Vanilla'
, 'Wasabi'
, 'Watercress'
, 'Watermelon'
, 'Wheat'
, 'Wheatgrass'
, 'Yam'
, 'Yarrow'
];


