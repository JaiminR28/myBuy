
import { Wishlist } from '@/constants/types/types';
import useParsedLocalParams from '@/hooks/useParsedLocalParams';
import { db } from '@/lib/db';
import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, Text } from 'react-native';

const WishlistDetail = () => {
  const [isLoading ,setIsLoading] = useState(true);

  const {id = null} = useParsedLocalParams();

  console.log({id});


  const handleGetWishlistData = useCallback( async() => {
    const wishlist = db.getFirstSync<Wishlist>(`SELECT * FROM wishlists WHERE id = ${id}`);

    console.log({wishlist});

    if(wishlist) {
      // get all the wishlist items here
      const wishlistData = await db.getAllAsync(`SELECT * FROM product_list WHERE wishlist_id = ${wishlist.id}`);

      console.log({wishlistData});
    }
  }, [id]);


  useEffect(() => {
    if(id) {
          handleGetWishlistData();
    }

  }, [id])
  return (
    <SafeAreaView>
      <Text>WishlistDetail</Text>
    </SafeAreaView>
  )
}

export default WishlistDetail