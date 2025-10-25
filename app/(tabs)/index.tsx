import NewWishlistPrompt, {
  TitleInputModalRef,
} from "@/components/newWishlistPrompt";
import WishlistListItem from "@/components/wishlistListItem";
import { wishlistWithItems } from "@/constants/types/types";
import { db } from "@/lib/db";
import DeepLinkHandler from "@/utils/deepLinkHandler";
import { Entypo } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { SQLiteRunResult } from "expo-sqlite";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from "react-native";
import { showMessage } from "react-native-flash-message";


export default function HomeScreen() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [sharedUrls, setSharedUrls] = useState<string[]>([]);
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  const [wishlists, setWishlists] = useState<wishlistWithItems[]>([]);

  const refreshSharedUrls = useCallback(() => {
    const urls = DeepLinkHandler.getSharedUrls();
    setSharedUrls(urls);
  }, []);

  const clearSharedUrls = useCallback(() => {
    DeepLinkHandler.clearSharedUrls();
    setSharedUrls([]);
  }, []);

  const handleGetAllWishlists = useCallback(async () => {
    try {
      setIsLoading(true);
      const wishlistsData = await db.getAllAsync<wishlistWithItems>(`SELECT 
    wishlists.*,
    COALESCE(
        json_group_array(
            CASE 
                WHEN product_list.id IS NOT NULL THEN json_object(
                    'id', product_list.id,
                    'wishlist_id', product_list.wishlist_id,
                    'url', product_list.url,
                    'imageUrl', product_list.imageUrl,
                    'price', product_list.price,
                    'isBought', product_list.isBought,
                    'description', product_list.description,
                    'broughtData', product_list.broughtData,
                    'lastUpdated', product_list.lastUpdated,
                    'title', product_list.title
                )
                ELSE NULL
            END
        ), 
        '[]'
    ) AS wishlistItems
FROM 
    wishlists
LEFT JOIN 
    product_list ON wishlists.id = product_list.wishlist_id
GROUP BY 
    wishlists.id;
`);
      setWishlists(wishlistsData);
    } catch (error) {
      console.log("Error in handleGetAllWishlists : ", { error });
      showMessage({
        type: "danger",
        message: "Could not fetch your wishlist Data",
        description: "Check back later or try creating a new wishlist",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);
  // INIT
  useEffect(() => {
    handleGetAllWishlists();
    refreshSharedUrls(); // Initial load of shared URLs
  }, [handleGetAllWishlists, refreshSharedUrls]);

  // Set up interval to check for new shared URLs
  useEffect(() => {
    const interval = setInterval(() => {
      refreshSharedUrls();
    }, 2000); // Check every 2 seconds

    return () => clearInterval(interval);
  }, [refreshSharedUrls]);



  const titleModalRef = useRef<TitleInputModalRef>(null);

  // Handle form submission
  const handleTitleSubmit = async (title: string) => {
    try {
      // Use executeSqlAsync to get the insertion result
      let insertResult: SQLiteRunResult | undefined;

      await db.withTransactionAsync(async () => {
        insertResult = await db.runAsync(
          `INSERT INTO wishlists (title, createdAt, type) VALUES ('${title}', '${new Date().toISOString()}', 'Monthly')`
        );
      });

      // Tell TS that insertResult is definitely assigned here
      if (insertResult) {
        router.push({
          pathname: "/wishlistDetail",
          params: {
            id: insertResult.lastInsertRowId,
          },
        });
      } else {
        console.error("Insert failed, no result returned");
      }

      // Redirect to the new wishlist page with ID as parameter
      // router.push(`/wishlist/${insertedId}`);
    } catch (error) {
      console.error("Database error:", error);
      Alert.alert("Error", "Failed to create wishlist");
    }
  };

  const renderItem = useCallback(({ item, index }: any) => {
    return <WishlistListItem wislistInfo={item} index={index} router={router} />;
  }, [router]);

  return (
    <SafeAreaView className=" flex-1">
      {/* HEADER */}
      <View className=" p-5">
        <View className="flex-row items-center justify-between">
          <Text className="text-4xl font-semibold ">My Wishlist</Text>

          <TouchableHighlight
            underlayColor="#f1f3f5"
            onPress={() => titleModalRef.current?.showModal()}
            className="p-3 rounded-2xl items-center justify-center border mb-4 border-gray-700"
          >
            <Entypo name="plus" size={30} color="#343a40" />
          </TouchableHighlight>
        </View>
        
        {/* Debug Section for Shared URLs */}
        <View className="mt-4 p-3 bg-gray-100 rounded-lg">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-lg font-semibold text-gray-800">🔗 Shared URLs Debug</Text>
            <View className="flex-row space-x-2">
              <TouchableOpacity
                onPress={() => setShowDebugInfo(!showDebugInfo)}
                className="px-3 py-1 bg-blue-500 rounded"
              >
                <Text className="text-white text-sm">
                  {showDebugInfo ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={clearSharedUrls}
                className="px-3 py-1 bg-red-500 rounded"
              >
                <Text className="text-white text-sm">Clear</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {showDebugInfo && (
            <ScrollView className="max-h-40">
              {sharedUrls.length === 0 ? (
                <Text className="text-gray-500 italic">No shared URLs yet</Text>
              ) : (
                sharedUrls.map((url, index) => (
                  <View key={index} className="mb-2 p-2 bg-white rounded border">
                    <Text className="text-xs text-gray-600 mb-1">
                      #{index + 1} - {new Date().toLocaleTimeString()}
                    </Text>
                    <Text className="text-sm text-gray-800" numberOfLines={2}>
                      {url}
                    </Text>
                  </View>
                ))
              )}
            </ScrollView>
          )}
          
          <Text className="text-xs text-gray-500 mt-1">
            Total URLs: {sharedUrls.length} | Auto-refresh every 2s
          </Text>
        </View>
        
        {/* <Text>Paste the Url here</Text>
      <TextInput style={{borderWidth : 1, fontSize : 12, padding : 8}} onChangeText={setUrl} />
      <Button onPress={handleGetProductDetails} title="Submit" />
      <Button onPress={handleGetProductDetails} title="Reload" />

      {submittedUrl.length > 0 ? (
        <WebView
        renderError={() => <View><Text>Error</Text></View>}
          javaScriptEnabled={true}
          injectedJavaScript={scrapeScript}
          onMessage={handleMessage}
          style={{ height: 100, width: 100 }}
          source={{ uri: submittedUrl }}
        />
      ) : null} */}
      </View>
      <NewWishlistPrompt
        ref={titleModalRef}
        onSubmit={handleTitleSubmit}
        headerText="Create New Wishlist"
        inputPlaceholder="Enter wishlist title"
        submitText="Create Item"
        modalProps={{
          animationIn: "slideInUp",
          animationOut: "slideOutDown",
          backdropOpacity: 0.7,
        }}
      />

      <View className=" flex-1 p-4">
        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-500">Loading wishlists...</Text>
          </View>
        ) : (
          <FlashList
            data={wishlists}
            renderItem={renderItem}
            masonry
            ItemSeparatorComponent={() => <View className="my-2" />}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
