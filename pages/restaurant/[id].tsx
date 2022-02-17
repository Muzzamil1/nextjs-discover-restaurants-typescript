/* eslint-disable jsx-a11y/anchor-is-valid */
import { useContext, useEffect, useState } from 'react';

import cls from 'classnames';
import {
  GetStaticPropsResult,
  GetStaticProps,
  GetStaticPropsContext,
  InferGetStaticPropsType
} from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import useSWR from 'swr';

import { fetchRestaurants, IRestaurant } from '../../lib/restaurants';
import { StoreContext } from '../../store/store-context';
import styles from '../../styles/restaurant.module.css';
import { fetcher, isEmpty } from '../../utils';

export async function getStaticProps(staticProps: GetStaticPropsContext) {
  const params = staticProps.params!;

  const restaurants = await fetchRestaurants();
  const findRestaurantById = restaurants.find((restaurant) => {
    return restaurant.id.toString() === params.id; //dynamic id
  });

  return {
    props: {
      restaurant: findRestaurantById ? findRestaurantById : {},
    },
  };
}

export async function getStaticPaths() {
  const restaurants = await fetchRestaurants();
  const paths = restaurants.map((restaurant) => {
    return {
      params: {
        id: restaurant.id.toString(),
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
}

const Restaurant = (initialProps: any) => {
  const router = useRouter();

  const id = router.query.id;

  const [restaurant, setRestaurant] = useState(initialProps.restaurant || {});

  const {
    state: { restaurants, },
  } = useContext(StoreContext);

  const handleCreateRestaurant = async (restaurant: IRestaurant) => {
    try {
      const { id, name, voting, imgUrl, neighbourhood, address, } = restaurant;
      const response = await fetch('/api/createRestaurant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          name,
          voting: 0,
          imgUrl,
          neighbourhood: neighbourhood || '',
          address: address || '',
        }),
      });

      const dbRestaurant = await response.json();
    } catch (err) {
      console.error('Error creating restaurant store', err);
    }
  };

  useEffect(() => {
    if (isEmpty(initialProps.restaurant)) {
      if (restaurants.length > 0) {
        const RestaurantFromContext: IRestaurant = restaurants.find(
          (restaurant) => {
            return restaurant.id.toString() === id; //dynamic id
          }
        );

        if (RestaurantFromContext) {
          setRestaurant(RestaurantFromContext);
          handleCreateRestaurant(RestaurantFromContext);
        }
      }
    } else {
      // SSG
      handleCreateRestaurant(initialProps.restaurant);
    }
  }, [id, initialProps, initialProps.restaurant, restaurants]);

  const {
    address = '',
    name = '',
    neighbourhood = '',
    imgUrl = '',
  } = restaurant;
  const [votingCount, setVotingCount] = useState(0);

  const { data, error, } = useSWR(`/api/getRestaurantStoreById?id=${id}`, fetcher);

  useEffect(() => {
    if (data && data.length > 0) {
      setRestaurant(data[0]);

      setVotingCount(data[0].voting);
    }
  }, [data]);

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  const handleUpVoteButton = async () => {
    try {
      const response = await fetch('/api/favoriteRestaurantById', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
        }),
      });

      const dbRestaurant = await response.json();

      if (dbRestaurant && dbRestaurant.length > 0) {
        const count = votingCount + 1;
        setVotingCount(count);
      }
    } catch (err) {
      console.error('Error up voting the restaurant', err);
    }
  };

  if (error) {
    return <div>Something went wrong retrieving restaurant page</div>;
  }

  return (
    <div className={styles.layout}>
      <Head>
        <title>{name}</title>

        <meta
          name='description'
          content={`${name} restaurant`}
        ></meta>
      </Head>

      <div className={styles.container}>
        <div className={styles.col1}>
          <div className={styles.backToHomeLink}>
            <Link href='/'>
              <a>← Back to home</a>
            </Link>
          </div>

          <div className={styles.nameWrapper}>
            <h1 className={styles.name}>{name}</h1>
          </div>

          <Image
            src={
              imgUrl ||
              'https://images.unsplash.com/photo-1504753793650-d4a2b783c15e?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80'
            }
            width={600}
            height={360}
            className={styles.storeImg}
            alt={name}
          ></Image>
        </div>

        <div className={cls('glass', styles.col2)}>
          <div className={styles.iconWrapper}>
            <Image
              src='/static/icons/places.svg'
              width='24'
              height='24'
              alt='places icon'
            />

            <p className={styles.text}>{address}</p>
          </div>

          {neighbourhood && (
            <div className={styles.iconWrapper}>
              <Image
                src='/static/icons/nearMe.svg'
                width='24'
                height='24'
                alt='near me icon'
              />

              <p className={styles.text}>{neighbourhood}</p>
            </div>
          )}

          <div className={styles.iconWrapper}>
            <Image
              src='/static/icons/star.svg'
              width='24'
              height='24'
              alt='star icon'
            />

            <p className={styles.text}>{votingCount}</p>
          </div>

          <button
            className={styles.upvoteButton}
            onClick={handleUpVoteButton}
          >
            Up vote!
          </button>
        </div>
      </div>
    </div>
  );
};

export default Restaurant;
