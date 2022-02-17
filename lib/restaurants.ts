//initialize unsplash

import { createApi } from 'unsplash-js';

import { config } from '../config';

export interface IRestaurant {
  id: string;
  address: string;
  name: string;
  neighbourhood: string;
  imgUrl: string;
  voting?: number;
}

// on your node server
const unsplashApi = createApi({
  accessKey: config.unsplashAccessKey,
  //...other fetch options
});

const getFoursquareUrl = (latLong: string, query: string, limit: number) => {
  return `https://api.foursquare.com/v3/places/nearby?ll=${latLong}&query=${query}&limit=${limit}`;
};

const getListOfRestaurantsPhotos = async () => {
  const photos = await unsplashApi.search.getPhotos({
    query: 'restaurant',
    perPage: 40,
  });
  const unsplashResults = photos.response?.results || [];

  return unsplashResults.map((result) => result.urls.small);
};

export const fetchRestaurants = async (
  latLong = '31.563409009382653,74.36181729294113',
  limit = 8
): Promise<IRestaurant[] | []> => {
  try {
    const photos = await getListOfRestaurantsPhotos();
    const response = await fetch(
      getFoursquareUrl(latLong, 'restaurant', limit),
      {
        headers: {
          Authorization: config.foursquareApiKey,
        },
      }
    );
    const data = await response.json();

    return (
      data.results?.map((venue: any, idx: number) => {
        const neighbourhood = venue.location.neighborhood;

        return {
          // ...venue,
          id: venue.fsq_id,
          address: venue.location.address || '',
          name: venue.name,
          neighbourhood:
            (neighbourhood && neighbourhood.length > 0 && neighbourhood[0]) ||
            venue.location.cross_street ||
            '',
          imgUrl: photos[idx],
        };
      }) || []
    );
  } catch (error) {
    if (!config.foursquareApiKey || !config.unsplashAccessKey) {
      console.error(
        '🚨 Make sure to setup your API keys, checkout the docs on Github 🚨'
      );
    }

    console.log('Something went wrong fetching restaurants', error);

    return [];
  }
};
