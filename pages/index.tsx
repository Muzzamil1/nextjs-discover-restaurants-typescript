import { useEffect, useState, useContext } from 'react';

import {
  GetStaticPropsResult,
  GetStaticProps,
  GetStaticPropsContext,
  InferGetStaticPropsType
} from 'next';
import Head from 'next/head';
import Image from 'next/image';

import Banner from '../components/banner';
import Card from '../components/card';
import useTrackLocation from '../hooks/use-track-location';
import { fetchRestaurants, IRestaurant } from '../lib/restaurants';
import { EActionTypes, StoreContext } from '../store/store-context';
import styles from '../styles/Home.module.css';

export async function getStaticProps(
  context: GetStaticPropsContext
): Promise<GetStaticPropsResult<HomeProps>> {
  const restaurants = await fetchRestaurants();

  return {
    props: {
      restaurants,
    }, // will be passed to the page component as props
  };
}

interface HomeProps {
  restaurants: IRestaurant[];
}

const Home = (props: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { handleTrackLocation, locationErrorMsg, isFindingLocation, } =
    useTrackLocation();

  const [restaurantError, setRestaurantError] = useState('');

  const { dispatch, state, } = useContext(StoreContext);

  const { restaurants, latLong, } = state;

  useEffect(() => {
    const setRestaurantByLocation = async () => {
      if (latLong) {
        try {
          const response = await fetch(
            `/api/getRestaurantsByLocation?latLong=${latLong}&limit=30`
          );

          const restaurantsByLocation = await response.json();

          dispatch({
            type: EActionTypes.SET_RESTAURANTS,
            payload: {
              restaurants: restaurantsByLocation,
            },
          });

          setRestaurantError('');
        } catch (error) {
          //set error
          const msg = (error as Error).message;
          setRestaurantError(msg);
        }
      }
    };
    setRestaurantByLocation();
  }, [latLong, dispatch]);

  const handleOnBannerBtnClick = () => {
    handleTrackLocation();
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Restaurant Connoisseur</title>

        <link
          rel='icon'
          href='/favicon.ico'
        />

        <meta
          name='description'
          content='allows you to discover restaurants'
        ></meta>
      </Head>

      <main className={styles.main}>
        <Banner
          buttonText={
            isFindingLocation ? 'Locating...' : 'View restaurants nearby'
          }
          handleOnClick={handleOnBannerBtnClick}
        />

        {locationErrorMsg && <p>Something went wrong: {locationErrorMsg}</p>}

        {restaurantError && <p>Something went wrong: {restaurantError}</p>}

        <div className={styles.heroImage}>
          <Image
            src='/static/hero-image.png'
            width={700}
            height={400}
            alt='hero image'
          />
        </div>

        {restaurants.length > 0 && (
          <div className={styles.sectionWrapper}>
            <h2 className={styles.heading2}>Restaurants near me</h2>

            <div className={styles.cardLayout}>
              {restaurants.map((restaurant) => {
                return (
                  <Card
                    key={restaurant.id}
                    name={restaurant.name}
                    imgUrl={
                      restaurant.imgUrl ||
                      'https://images.unsplash.com/photo-1504753793650-d4a2b783c15e?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80'
                    }
                    href={`/restaurant/${restaurant.id}`}
                  />
                );
              })}
            </div>
          </div>
        )}

        {props.restaurants.length > 0 && (
          <div className={styles.sectionWrapper}>
            <h2 className={styles.heading2}>Lahore restaurants</h2>

            <div className={styles.cardLayout}>
              {props.restaurants.map((restaurant) => {
                return (
                  <Card
                    key={restaurant.id}
                    name={restaurant.name}
                    imgUrl={
                      restaurant.imgUrl ||
                      'https://images.unsplash.com/photo-1504753793650-d4a2b783c15e?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80'
                    }
                    href={`restaurant/${restaurant.id}`}
                  />
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
