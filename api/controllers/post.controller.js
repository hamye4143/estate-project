import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";

export const roomType = ['apartment', 'condo', 'officetel', 'one_room', 'two_room', 'land'];
export const payType = ['month_pay', 'year_pay', 'sell'];
export const MAX_PRICE = 1000000000;
export const MIN_PRICE = 0;
export const MAX_SIZE = 60;
export const MIN_SIZE = 0;

function getRadians(degree) {
  const radians = (Number(degree) * Math.PI) / 180;
  return radians;
}

export const getPosts = async (req, res) => {
  const query = req.query;

  console.log('query입니다.', query);
  try {

    // 반경 3 km 까지 검색 (위도 경도 반경 계산)
    // const xprisma = prisma.$extends({
    //   result: {
    //     post: {
    //       distance: {
    //         // the dependencies
    //         needs: {latitude: true, longitude: true},
    //         compute(post) {
    //           // the computation logic
    //           return (6371 * Math.acos(Math.cos(getRadians(query.latitude)) * Math.cos(getRadians(post.latitude)) * Math.cos(getRadians(post.longitude) - getRadians(query.longitude)) + Math.sin(getRadians(query.latitude)) * Math.sin(getRadians(post.latitude))));
    //         },
    //       },
    //       isSaved: {
    //         compute() {
    //           return false;
    //         }
    //       },
    //     },
    //   },
    //   query: {
    //     post: {
    //       async findMany({model, operation, args, query}) {
    //         // take incoming `where` and set `age`
    //         args.where = {...args.where, price: {gt: 10}}
    //
    //         return query(args)
    //       },
    //     },
    //   },
    // });
    // const posts = await xprisma.post.findMany({});

    let queryType = [];
    let queryProperty = [];

    if (typeof query.type === 'string' || query.type instanceof String) { // 한개 선택했을 때 string으로 받음
      queryType = [query.type]; //리스트로 만들어주기
    } else {
      queryType = query.type;
    }
    if (typeof query.property === 'string' || query.property instanceof String) {
      queryProperty = [query.property];
    } else {
      queryProperty = query.property;
    }


    //minPrice 값 없을 때
    const minPriceQuery = (query.minPrice === null || query.minPrice === undefined || query.minPrice === "") ? {$gte: MIN_PRICE} : {$gte: Number(query.minPrice)};
    //maxPrice 값 없을 때
    const maxPriceQuery = (query.maxPrice === null || query.maxPrice === undefined || Number(query.maxPrice) >= MAX_PRICE || query.maxPrice === "") ? {} : {$lte: Number(query.maxPrice)};

    //minSize 값 없을 때
    const minSizeQuery = (query.minSize === null || query.minSize === undefined || query.minSize ==="") ? {$gte: MIN_SIZE} : {$gte: Number(query.minSize)};
    //maxSize 값 없을 때 (60이상 값이 들어오면 사이즈 무한대로 보여줌)
    const maxSizeQuery = (query.maxSize === null || query.maxSize === undefined || Number(query.maxSize) >= MAX_SIZE || query.maxSize === "") ? {} : {$lte: Number(query.maxSize)};


    let maxDistance = null;
    if(query.search_type === 'user_map_move') {
      maxDistance = 20000000;
    }else {

    }

    //mongodb Atlas에 create Index {location:2dsphere} 작업 필요
    const posts = await prisma.post.aggregateRaw({
      pipeline: [
        // {
        //   $geoNear: {
        //     near: {type: "Point", coordinates: [Number(query.longitude), Number(query.latitude)]},
        //     distanceField: "dist.calculated",
        //     maxDistance: 200, //200km  200000
        //     spherical: true,
        //     query: {
        //       politicalList: { $in: [query.political] },
        //       price: {...minPriceQuery, ...maxPriceQuery}, //{$gte: Number(query.minPrice), $lte: Number(query.maxPrice)},
        //       type: {$in: (query.type === undefined || query.type === null || query.type === "") ? payType : queryType},
        //       property: {$in: (query.property === undefined || query.property === null || query.property ==="") ? roomType : queryProperty},
        //       size:  {...minSizeQuery, ...maxSizeQuery},
        //     },
        //   },
        // },
        // {
        //   $geoNear: {
        //     near: {type: "Point", coordinates: [Number(query.longitude), Number(query.latitude)]},
        //     distanceField: "dist.calculated",
        //     maxDistance: 20000000, //200km  200000
        //     spherical: true,
        //   }
        // },
        {
          $geoNear: {
            near: {type: "Point", coordinates: [Number(query.longitude), Number(query.latitude)]},
            distanceField: "dist.calculated",
            maxDistance: 20000000, //200km  200000
            spherical: true,
          }
        },
        {
          $match: {
            politicalList: { $in: [query.political] },
            price: {...minPriceQuery, ...maxPriceQuery},
            type: {$in: (query.type === undefined || query.type === null || query.type === "") ? payType : queryType},
            property: {$in: (query.property === undefined || query.property === null || query.property ==="") ? roomType : queryProperty},
            size:  {...minSizeQuery, ...maxSizeQuery},
          }
        },
        {
          $lookup: {
            from: "SavedPost",
            localField: "_id",
            foreignField: "postId",
            as: "savedPostList"
          }
        },
        {
          $sort: {
            _id: 1,
          }
        }
      ],
    });

    const savedPosts = await prisma.user.findUnique({
      where: {
        id: req.userId
      },
      include: {
        savedPosts: true,
      }
    });

    const savedPostIds = savedPosts.savedPosts.map((save) => {
      return save.postId;
    });

    posts.forEach((post) => {
      post.isSaved = false;
      savedPostIds.forEach((savedId) => {
        if (post._id.$oid === savedId) {
          post.isSaved = true;
        }
      })
    });

    console.log('완성', posts);
    // setTimeout(() => {
      res.status(200).json(posts);
    // }, 1500);


  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "포스트를 가져오는데 실패했습니다." });
  }
};

export const getPost = async (req, res) => {
  const id = req.params.id;

  try {
    const post = await prisma.post.findUnique({
      where: { id: id },
      include: {
        postDetail: true,
        user: {
          select: {
            username: true,
            avatar: true,
          },
        },
        savedPosts:true,
      },
    });

    const token = req.cookies?.token;

    const savedCount = post.savedPosts.length;

    if (token) {

      jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
        if (!err) {

          const saved = await prisma.savedPost.findUnique({
            where: {
              userId_postId: {
                postId: id,
                userId: payload.id,
              },
            },
          });
          return res.status(200).json({ ...post, isSaved: saved ? true : false, savedCount });
        }
      });
    }else {
      return res.status(200).json({ ...post, isSaved: false, savedCount });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "포스트를 가져오는데 실패했습니다." });
  }
};

export const addPost = async (req, res) => {
  const body = req.body;
  const tokenUserId = req.userId;

  console.log('body', body);

  try {
    const newPost = await prisma.post.create({
      data: {
        ...body.postData,
        userId: tokenUserId,
        location: { type: "Point", coordinates: [ Number(body.postData.longitude), Number(body.postData.latitude)]},
        postDetail: {
          create: body.postDetail,
        },
      },
    });
    res.status(200).json(newPost);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "포스트를 저장하는데 실패했습니다." });
  }
};

export const updatePost = async (req, res) => {
  const postId = req.params.id;
  const body = req.body;
  const tokenUserId = req.userId;

  try {

    const post = await prisma.post.findUnique({
      where: {id: postId},
    });

    if (post.userId !== tokenUserId) {
      return res.status(403).json({message: "권한이 없습니다."});
    }

    const updatedPost = await prisma.post.update({
      where: {id: postId},
      data: {
        ...body.postData,
        postDetail: {
          update: body.postDetail,
        },
      },
    });

    //setTimeout(() => {
    res.status(200).json(updatedPost.id);
    //}, 3000);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "포스트 수정하는데 실패했습니다." });
  }
};

export const deletePost = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;

  try {
    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (post.userId !== tokenUserId) {
      return res.status(403).json({ message: "권한이 없습니다." });
    }

    await prisma.post.delete({
      where: { id },
    });

    res.status(200).json({ message: "포스트가 삭제되었습니다." });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "포스트를 삭제하는데 실패했습니다." });
  }
};