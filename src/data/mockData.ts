import { UserProfile, Room, Post, SharedStory, Challenge, ActivityItem, MessageThread } from '../types';

export const currentUser: UserProfile = {
  id: 'usr_elena',
  handle: 'elena_v',
  displayName: 'Elena Vance',
  pronouns: 'she/her',
  roleTitle: 'Circle Creator & Story Architect',
  avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBoHxbAxMax8M47qEMnZLNNH-T8OpkT0zVA471vkqcOiF5SjfBSnDslwBOZCGs2WCrIEX9IFIlpB0aHGnS-tBDQSNx6uWIiHPQCkFCBeVLzCP2dzJUEsgl5nU2Gt-MPF4otdr6Y_XSiaCteFyKplCwJxcRANd9f-d-iSww_j3HABJjNkA5m1UsXpVtvRrS2oCQ2qswMp_Dvbv3h1EfzWJBmfxzIi5IoyHmT6ofW69hkx822gTLfsmxc7Cqzp6aIvCBm8ruhxsM7JQ',
  bio: 'Visual designer & light observer. Exploring brutalist shadows, tactile ceramics, and collaborative travel journals.',
  activeRoom: {
    id: 'room_kyoto',
    name: 'Kyoto Field Notes',
  },
  stats: {
    challenges: 5,
    sharedStories: 8,
    processGuides: 34,
  },
  gearList: [
    'Leica Q2 • 28mm Summilux f/1.7',
    'Hasselblad 500 C/M • Carl Zeiss 80mm',
    'Fujifilm TX-1 Panoramic',
  ],
  quietModeEnabled: false,
};

export const sampleStories: SharedStory[] = [
  {
    id: 'story_ella',
    title: 'Weekend in Ella',
    coverImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4rv1v-fOKpc5HWu_sGckuzoQJo489M9Gk7oRG8ZhCfO8G8CKf5xIpOQnlfJY2hMbW1dYMquuM7Qai7SKTlafLw-G3iiI6MjhR7Ng1AUQZ62QVgSUhT7ZBTMpeNGvqEZ7s5OSdURunThiWDyHeDf9_EFGviZvOd282VlUEdfRqCofiYMJfjigfYoLZPNPVh-z_H4oSNfntmLKzKKApvo94DTU6BeAzPxg4R4lteyKOE-sX1ViGdLLv6gi-BwDsYRfelIlzCUfm1w',
    contributorsCount: 4,
    hasUnread: true,
    contributors: [
      {
        id: 'c1',
        name: 'Chloe Lens',
        handle: 'chloe.lens',
        avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAfQOlqbYCJwTQuKaH9pCqXyZk_Aiyi7AxCGl877_LpQ5tNAPIVpPMx-1whBwF172E8lPF_Dq8h27nF1Kzlc8OXr-OK1Rjwg1CyBdZCiPqGdGQWTkoOk0xNLuUr9VZyfKBtTSDb76fnK1094q27791EAoyjKxyfxajfsVt0kphyWiJJzvoyTwQUmzM3I9nBT6Swl0fGu7QjHf7kaT2glj16zPbwUW6nXqC7QWDPDx1VeFp9RSkAGOID6eJJnSuCZGW7JpDQe6sURw',
      },
      {
        id: 'c2',
        name: 'Marcus Vance',
        handle: 'marcus_v',
        avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB22aVdnEFpmuHdn1iI2MeuXcB_puv8Hh_AFzBRm4M0mIUo5g_oKfibjqgj1nkcrPbkdCLufPTLVzDigfB63Y72_PKl_qYtQeXdDx124GP8-MaRhnNFF8b4hbhl5df6e2Zs1bavEhcmgRM6aBkq6lsMrILHWENKgHsF01O5I4YNUnLJvDvxPoLEBOTIK35Wmt2UBldB7mDJ9n2n8iqpb80SXOgqHiGdCaOD3D2v5PWNyxVl4MtnnPYAZ14AaeafYecrQGIRpwoPsg',
      },
      {
        id: 'c3',
        name: 'Elena Vance',
        handle: 'elena_v',
        avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAkVvzYifPwFTC0MlEWW582ICRuq2Tos_WgWLAz56fhVF_0Vhwm4ZHkS6CLHjwuZtLn4leG2J959nJxUpnVJPoh4YpzlqAW-rkack3e8tIh8Dcj1wO8f-KpUB3beFVV9POPE3Wedw_SovcuOZPuCjTdh2qRuQIFPynwCXQlldUlec_Qe-qXr0ij7jOL9_8D6nHqOeP9PaahL_0OeQQ6wQ9XPiA94mIcZc5xl2JrWUf1j_lrMGJ8Vaf4tZZ0XZIlm64gJdRA5FbC-A',
      },
      {
        id: 'c4',
        name: 'Samir Chen',
        handle: 'samir_c',
        avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBkOqajNNe0srkDvQfUZxvvnVCFTEf-73CHcrTqf1RaCCTGJ_JB5jVThOIZbgzPTDu40qDPWEAod2yEt_x7cLLHGh7CH9GJA6TiYnHms0ItQoPQCbCShGJ4wfTlbdjAL_5GC2AXWR_9bEuW8p0OXSyXnq6iIFUtKA6b16MbPnbLrkg-slESQGUIHOhUHRCItHOQd5TyH5O6pVwJz8t1mXvXqYggRn2mA4b9j3gjI_NPImctgWFFkouUlV_NqKFKL_oBGSWUCzrFdw',
      },
    ],
    slides: [
      {
        id: 'slide_1',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4rv1v-fOKpc5HWu_sGckuzoQJo489M9Gk7oRG8ZhCfO8G8CKf5xIpOQnlfJY2hMbW1dYMquuM7Qai7SKTlafLw-G3iiI6MjhR7Ng1AUQZ62QVgSUhT7ZBTMpeNGvqEZ7s5OSdURunThiWDyHeDf9_EFGviZvOd282VlUEdfRqCofiYMJfjigfYoLZPNPVh-z_H4oSNfntmLKzKKApvo94DTU6BeAzPxg4R4lteyKOE-sX1ViGdLLv6gi-BwDsYRfelIlzCUfm1w',
        contributor: {
          id: 'c1',
          name: 'Chloe Lens',
          handle: 'chloe.lens',
          avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAfQOlqbYCJwTQuKaH9pCqXyZk_Aiyi7AxCGl877_LpQ5tNAPIVpPMx-1whBwF172E8lPF_Dq8h27nF1Kzlc8OXr-OK1Rjwg1CyBdZCiPqGdGQWTkoOk0xNLuUr9VZyfKBtTSDb76fnK1094q27791EAoyjKxyfxajfsVt0kphyWiJJzvoyTwQUmzM3I9nBT6Swl0fGu7QjHf7kaT2glj16zPbwUW6nXqC7QWDPDx1VeFp9RSkAGOID6eJJnSuCZGW7JpDQe6sURw',
        },
        timestamp: '06:15 AM',
        location: 'Nine Arches Viaduct',
        caption: 'Misty morning climb above the tea plantations before the first train whistle echoed.',
      },
      {
        id: 'slide_2',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMPgCDBQq3pP82BnHev0Vbx39riw0Dvp9ZG93Ql0B354lspPlD2vzqF7vkhtJQRukjc9Ntypz44QsRdN__7_3qOfZEkIztSF2tqxPqE_la9vh1fxHj5qGPYTbQTCIoPKLYhnm2_ws4KO_7nqjVn043H2KAYbEF1cPRX2vzAm3OBV9FVGeJ4yjVHfgJV5HLtUHELvb3QjpcA0ZiO8NLCv8mSfAabXgvkgPFpqdTUspq-kXkZyFpMSsBne_VrlrAQ7N1M9VmWFThpw',
        contributor: {
          id: 'c2',
          name: 'Marcus Vance',
          handle: 'marcus_v',
          avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB22aVdnEFpmuHdn1iI2MeuXcB_puv8Hh_AFzBRm4M0mIUo5g_oKfibjqgj1nkcrPbkdCLufPTLVzDigfB63Y72_PKl_qYtQeXdDx124GP8-MaRhnNFF8b4hbhl5df6e2Zs1bavEhcmgRM6aBkq6lsMrILHWENKgHsF01O5I4YNUnLJvDvxPoLEBOTIK35Wmt2UBldB7mDJ9n2n8iqpb80SXOgqHiGdCaOD3D2v5PWNyxVl4MtnnPYAZ14AaeafYecrQGIRpwoPsg',
        },
        timestamp: '11:40 AM',
        location: 'Artisan Kiln & Studio',
        caption: 'Clay cooled by mountain breeze. Marcus documenting raw earthenware shapes.',
      }
    ]
  },
  {
    id: 'story_nordic',
    title: 'Nordic Pottery',
    coverImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMPgCDBQq3pP82BnHev0Vbx39riw0Dvp9ZG93Ql0B354lspPlD2vzqF7vkhtJQRukjc9Ntypz44QsRdN__7_3qOfZEkIztSF2tqxPqE_la9vh1fxHj5qGPYTbQTCIoPKLYhnm2_ws4KO_7nqjVn043H2KAYbEF1cPRX2vzAm3OBV9FVGeJ4yjVHfgJV5HLtUHELvb3QjpcA0ZiO8NLCv8mSfAabXgvkgPFpqdTUspq-kXkZyFpMSsBne_VrlrAQ7N1M9VmWFThpw',
    contributorsCount: 2,
    hasUnread: true,
    contributors: []
  },
  {
    id: 'story_tokyo',
    title: 'Tokyo Nights',
    coverImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNlLPGxPQ24wQmDnEdXmntTUYvazyKvO3YfEQ0WYw8be89Dxzy0mmiyH1aq97ZM7OE-F21v3CXhQD1WkpDgYJv5oebg6pYKKZd3U-G4swhWxJITyRrIBUEQQtq9PlnIv48BrqYf8hzvR1MxZzYWN7_w6-cB1thZdmhacmB_tNBlc5SRFcLxUnPS7bpM8W3c18ItoB0NnOHFWYNWPQXGIKyOyA0_H8RLdhHJVMkfljvwQQjO4eINz75J0gbcoTh_Ye8V43QqqtgSw',
    contributorsCount: 3,
    hasUnread: false,
    contributors: []
  },
  {
    id: 'story_film',
    title: 'Film Journal',
    coverImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB6sypg6hqpVBI9wBzUlpjipgPWJw5xNnA2726mgggl1KsL72S-B6Kj0zXlCCPCvHPkJZxw2m66kP3m8oOVOeZ_Wn0ptUdQr-69jXHuJ8W_MHxgT2gFSKRWcIV43WO8FQOz6LD-G8nGGabwkABYnIpnz_W-VytnHSzVp5ET34oas4zBT13HrFag9qaDRc6YTBr7BrdH-3Qxvhw2yiI1MfqArtoH9bAUimfoeXqioKcWUdHOChwIbr0t6WhJ0_7sGTK4iup6qTFyIw',
    contributorsCount: 5,
    hasUnread: false,
    contributors: []
  }
];

export const sampleRooms: Room[] = [
  {
    id: 'street-photography',
    name: 'Street Photography',
    slug: 'street-photography',
    category: 'Photography',
    description: 'Curated visual forum for geometric framing, candid light studies, and everyday human movement. Strictly original 35mm & digital work.',
    coverImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBciLOWFL5ZYR_89o0WU85NqPe75G6DBnAkC4kbU5qxsTHILVOjaejxSKBSkRvhnRij1NfizdFntL94sRpJ8v-4iPHgaYDNCWn4BHRH1IhEY-rdMb2Y8vmLjKrqgSyg-ZGSHuvRfYxlRS3BvieUgqPcPnthZkx0dzauIQmIrntrrSBXZguW0y_dXV96p-4NJCynjnKIn7CDX9EtxOfN9ubvGxeazNsa5pPrTjvM81adJZU2qvR8R8sl-a0dbi3MFzdZPG_UPWy6Aw',
    isPrivate: false,
    isJoined: true,
    membersCount: 14200,
    activeCount: 82,
    isFeatured: true,
  },
  {
    id: 'home-cooking',
    name: 'Home Cooking & Craft',
    slug: 'home-cooking',
    category: 'Culinary',
    description: 'Sourdough ferments, heirloom culinary recipes, slow food techniques, and rustic ceramic table settings.',
    coverImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-s_FMLrPkkyJa1qO39uedKD1W1YmXOBv4UqAo3_nQVy7T56O4tV9feYTKaokpvgl67mCZnUFzqzFt1whQogeFVZIW6smVtCSEjE0DH2NgpIVZnXJaV9S_sjnMgm97qoSaxjkdI2LC5nd1XBYnl3DiA692AO_Lrr8eYorYxySxvhiX4G5jK9lh1ekQqeUgKsev-afHQjQ3nUifHO5DMGmFtLbSg0p4DhyO5yZaS8vZ7B0YXZkQE2pge8Yo8C9ON5k--gdcWWQzcw',
    isPrivate: false,
    isJoined: false,
    membersCount: 8900,
    activeCount: 45,
    isFeatured: false,
  },
  {
    id: 'nordic-ceramics',
    name: 'Nordic Ceramics Studio',
    slug: 'nordic-ceramics',
    category: 'Visual Arts',
    description: 'Tactile stoneware, minimal glazes, reduction kiln firings, and sculptural balance.',
    coverImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMPgCDBQq3pP82BnHev0Vbx39riw0Dvp9ZG93Ql0B354lspPlD2vzqF7vkhtJQRukjc9Ntypz44QsRdN__7_3qOfZEkIztSF2tqxPqE_la9vh1fxHj5qGPYTbQTCIoPKLYhnm2_ws4KO_7nqjVn043H2KAYbEF1cPRX2vzAm3OBV9FVGeJ4yjVHfgJV5HLtUHELvb3QjpcA0ZiO8NLCv8mSfAabXgvkgPFpqdTUspq-kXkZyFpMSsBne_VrlrAQ7N1M9VmWFThpw',
    isPrivate: false,
    isJoined: true,
    membersCount: 5300,
    activeCount: 29,
    isFeatured: false,
  },
  {
    id: 'tokyo-notes',
    name: 'Tokyo Field Notes',
    slug: 'tokyo-notes',
    category: 'Photography',
    description: 'Nocturnal telephoto perspectives, rainfall refractions, and solitary city corridors.',
    coverImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNlLPGxPQ24wQmDnEdXmntTUYvazyKvO3YfEQ0WYw8be89Dxzy0mmiyH1aq97ZM7OE-F21v3CXhQD1WkpDgYJv5oebg6pYKKZd3U-G4swhWxJITyRrIBUEQQtq9PlnIv48BrqYf8hzvR1MxZzYWN7_w6-cB1thZdmhacmB_tNBlc5SRFcLxUnPS7bpM8W3c18ItoB0NnOHFWYNWPQXGIKyOyA0_H8RLdhHJVMkfljvwQQjO4eINz75J0gbcoTh_Ye8V43QqqtgSw',
    isPrivate: false,
    isJoined: false,
    membersCount: 11400,
    activeCount: 64,
    isFeatured: false,
  }
];

export const samplePosts: Post[] = [
  {
    id: 'post_1',
    author: {
      id: 'milo',
      handle: 'milo_lens',
      name: 'Milo Lens',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDobuu7cvuIdyUsa3diPmHeOsydIsme19Fd9nmC4dM0H6PJ4gYWdMqvL9X101TTBF5TTzyW-UWGWELh3FoJMHb2KPBDs5r8--P9djcUTDn8HzxD2eXbPSqflky4CBG0ReDWM4lEHRq_UCz5Ch5kFpOVljbzo04DF6ZcdjxTrSMX3pqsdBuU7yYBRvfQsPpNtdYN2DSH2PaSVFQVV0Ios1fv85duWCeQ-lZxOVrQf2g3BrgiDLb3XopwB7aCK3wmK785aDZGpMJcWQ',
    },
    coAuthor: {
      id: 'clara',
      handle: 'clara_art',
      name: 'Clara Art',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAfQOlqbYCJwTQuKaH9pCqXyZk_Aiyi7AxCGl877_LpQ5tNAPIVpPMx-1whBwF172E8lPF_Dq8h27nF1Kzlc8OXr-OK1Rjwg1CyBdZCiPqGdGQWTkoOk0xNLuUr9VZyfKBtTSDb76fnK1094q27791EAoyjKxyfxajfsVt0kphyWiJJzvoyTwQUmzM3I9nBT6Swl0fGu7QjHf7kaT2glj16zPbwUW6nXqC7QWDPDx1VeFp9RSkAGOID6eJJnSuCZGW7JpDQe6sURw',
    },
    roomName: 'Street Photography',
    roomId: 'street-photography',
    aspectRatio: '4:5',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDQVMMzKwDq_hIbX61uJ8xPaDKmx9KR885KCV9cs3ufIxXXUmXOO0fCxDcqDtRlPKz-Iw4_C1JkmR73ahRtzsFncOYiMt5lvwm_dEQwFbrSJ6PaZHFx9wfEa9uL65ZgrgucUs2a3QZTZQ0snr9ZkHQs76sSgmLEAY0M-H4l0BhhSpEYOZiMtd7hjhQap86FJg27A3mZcIZPF2UVp2T_QibuE7hmJSqkHqskCBVlx3MwlGcyePavitRj3XTEIfyfYFbKTzJpQ8tNIg',
    caption: 'Geometric intersections at noon. Developed in Room #4 with Clara\'s grading preset.',
    likesCount: 482,
    commentsCount: 24,
    isLiked: true,
    isBookmarked: false,
    createdAt: '2h ago',
  },
  {
    id: 'post_2',
    author: {
      id: 'sarah',
      handle: 'sarah_bakes',
      name: 'Sarah Wood',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDpdU8n27tIk0IuRYGCnaATqolu_b9RHKvOr2if26Z8qy6SA74KlFvdLPgnvr5KzkXBD43Bbnqtnlt5ZOrCeyVe5CWaU5BLJPM2esdcuqFDd9umMlD6xfquMpMJMUyhvQ_YNlJcyWyhydqdiMd-mHOcOQEa8LPjUV1DVIHfwE6ZxeN4w3zOENwqbWD83TkG4a9HkQsBqEOTJlV7VWEVH0rjLh6ZIAXlzzCLHCNYPYkk6_08-QZEC7UTXfyKYuT4lIKDSela2pFErQ',
    },
    roomName: 'Home Cooking',
    roomId: 'home-cooking',
    aspectRatio: '4:5',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDZqIt8MuWtG9iPU2I-IbAp0BNrx80p1xtukIveJ8jMxKSJnvhflxg4pG8vzzQidLnljvjmvVqWNG2t22soJmlTVD4YkAsZv6tzev6xarqfKF7Y2t2jAVKxIc1rUV5084pb-s3OVhqo1GtC8Sb-iBB-r0pfzlk1MVdRkGYE6s7HpgOuSI2QWum6I2sYqLDj-P2gNnzNJncOikPVVs0PI12CmE-ZIbUAhaiOLPpOtixWRghCD683-8uWEy4K-JLn_tjbM7W4as_EjQ',
    caption: '82% hydration country loaf after a 24h cold ferment. Swipe through process stages for crumb structure notes.',
    likesCount: 319,
    commentsCount: 18,
    isLiked: false,
    isBookmarked: true,
    processStagesCount: 3,
    createdAt: '4h ago',
  },
  {
    id: 'post_technique',
    author: {
      id: 'usr_elena',
      handle: 'elena_v',
      name: 'Elena Vance',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBoHxbAxMax8M47qEMnZLNNH-T8OpkT0zVA471vkqcOiF5SjfBSnDslwBOZCGs2WCrIEX9IFIlpB0aHGnS-tBDQSNx6uWIiHPQCkFCBeVLzCP2dzJUEsgl5nU2Gt-MPF4otdr6Y_XSiaCteFyKplCwJxcRANd9f-d-iSww_j3HABJjNkA5m1UsXpVtvRrS2oCQ2qswMp_Dvbv3h1EfzWJBmfxzIi5IoyHmT6ofW69hkx822gTLfsmxc7Cqzp6aIvCBm8ruhxsM7JQ',
    },
    roomName: 'Street Photography Room',
    roomId: 'street-photography',
    aspectRatio: '4:5',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJCd9W8asKFGdlU462f97KLir0O9_qKaScStYmPSO8PgdsVz_g1TDiTb14p26BTVAPHv3gf_KFHGUgbQbHo7Hp7iR0TY_f1EmL51HR1aHzp68cYA6nzobXhwWmvOl34IG7UU0gwAR6RKfudm7ljIq2ctItZLW9dzd1Agpv3PZbABFJuenK8KxC-eAGmjrbFygDhraMXd5Dcg9HZVMaDyh7eTHR6GdS4ZaB_PzgW-KI7PjiFOQ1KJy8jbmTlDFmy1AGxkLUsXh9mw',
    rawImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDr3guoVmV99k1a30wsI4AMDT6EHEIkBnZrKBzbG7_9dQFxHj4UPnti9PhFB3ar-zGp-L69FPvKyNwkQb-mvfQLN9o2oZy99HDtHOluuriG4hGiJ0zlWTD6w-0Pkh4GVHOYjgvbwq_ZgUHugdXiejN5t0MZR9UrIbfTfUYhF4vHDzBr5okeuci4hvNOlzC_AE21fly4_lbl8aogKIe_3_T2JvQ2tp5yCSeMrGsv4WhP5ld10g_FUUb67jwlpB2ryVCU-C6L_h9VbA',
    caption: 'Dappled Brutalism: Exposing for Highlights in Berlin\'s Kulturforum.',
    likesCount: 654,
    commentsCount: 42,
    isLiked: false,
    isBookmarked: true,
    processStagesCount: 3,
    cameraExif: {
      camera: 'Leica Q2',
      lens: '28mm Summilux f/1.7',
      settings: 'f/5.6 • 1/500s • ISO 200',
      format: 'DNG RAW 48MP',
    },
    processStages: [
      {
        stepNumber: 1,
        title: 'Gear & Setup',
        tag: 'In-Camera',
        description: 'Leica Q2, 28mm Summilux at f/5.6. ISO 200, 1/500s. Underexposed by 1 stop to protect highlight detail on polished stone.',
        gearSetup: 'Spot metering locked on sunlit column edge.',
      },
      {
        stepNumber: 2,
        title: 'Base Curve & Highlight Roll-off',
        tag: 'Lightroom',
        description: 'Pulling back blown stone values with an S-curve tailored for linear sensor roll-off. Preserves tactile cement grain.',
      },
      {
        stepNumber: 3,
        title: 'Split Toning & Color Balance',
        tag: 'Master',
        description: 'Infusing deep warm amber into midtones while pulling shadows slightly toward cool slate for atmospheric balance.',
      }
    ],
    createdAt: '2h ago',
  }
];

export const sampleChallenges: Challenge[] = [
  {
    id: 'your-city-after-dark',
    title: 'Your city after dark',
    subtitle: 'Street Photography Community',
    description: 'Explore the mood, geometry, and hidden stories of nighttime in your neighbourhood. Emphasize low light, natural reflections, and nocturnal rhythms.',
    roomName: 'Street Photography Room',
    roomId: 'street-photography',
    coverImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDAm4H2_o_Tb95w40en9zcJ7TehQavWMU-zWjytN0EvBEr-7xxqFIBmIFevbqUf1ALTin7mNP3RBpZW5gfrPeGbOParILYu7v07AbiyfZ2kbMPF2M5726DqZ1DH5CD1A9MPvUc6LGThxnAa3Zyvzn92LQNeu4t7SpHls_GdyqFq2HONaAP5ZT9tZzjuZpMwrw1WDJsIjNTy-Pgq8BJGznhreQcxWzMOxpUBcnRbxTohUQ9hylYnLOcDLXNVFwwnPYJgn9Spki12nA',
    closesIn: '4 days remaining',
    deadlineDate: 'Closes October 28',
    entriesCount: 348,
    isJoined: true,
    guidelines: [
      'Original work only',
      'Any camera format (Digital or Film)',
      'Include technical exposure notes',
    ],
    submissions: [
      {
        id: 'sub_1',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDJMxdieP69xAl_TFyYX3OV0EnvWHz45V8WNwRtf4PQYam2fA8U2-e6nyL8Piu6R3u-MPmINWKgkijYCRsM-ouOpGdQ0PpxUIq7f2oBE8sCqvmC5DIEpgarprINL-gYAu2AB0ObZU_neArTUC8gCPV1_NJdiS0ZyG40_BySSaUJY2zX96pb78AD2drJW-wDk5rgOjh7jDjySzREzlBT8Nd_PIHcX1iZUfQu0AtQox8PXW4LjOU-E749snKwHkJvasx6ewi0a-TKWQ',
        author: {
          id: 'c1',
          name: 'Chloe Lens',
          handle: 'chloe.lens',
          avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAfQOlqbYCJwTQuKaH9pCqXyZk_Aiyi7AxCGl877_LpQ5tNAPIVpPMx-1whBwF172E8lPF_Dq8h27nF1Kzlc8OXr-OK1Rjwg1CyBdZCiPqGdGQWTkoOk0xNLuUr9VZyfKBtTSDb76fnK1094q27791EAoyjKxyfxajfsVt0kphyWiJJzvoyTwQUmzM3I9nBT6Swl0fGu7QjHf7kaT2glj16zPbwUW6nXqC7QWDPDx1VeFp9RSkAGOID6eJJnSuCZGW7JpDQe6sURw',
        }
      },
      {
        id: 'sub_2',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNlLPGxPQ24wQmDnEdXmntTUYvazyKvO3YfEQ0WYw8be89Dxzy0mmiyH1aq97ZM7OE-F21v3CXhQD1WkpDgYJv5oebg6pYKKZd3U-G4swhWxJITyRrIBUEQQtq9PlnIv48BrqYf8hzvR1MxZzYWN7_w6-cB1thZdmhacmB_tNBlc5SRFcLxUnPS7bpM8W3c18ItoB0NnOHFWYNWPQXGIKyOyA0_H8RLdhHJVMkfljvwQQjO4eINz75J0gbcoTh_Ye8V43QqqtgSw',
        author: {
          id: 'milo',
          name: 'Milo Lens',
          handle: 'milo_lens',
          avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDobuu7cvuIdyUsa3diPmHeOsydIsme19Fd9nmC4dM0H6PJ4gYWdMqvL9X101TTBF5TTzyW-UWGWELh3FoJMHb2KPBDs5r8--P9djcUTDn8HzxD2eXbPSqflky4CBG0ReDWM4lEHRq_UCz5Ch5kFpOVljbzo04DF6ZcdjxTrSMX3pqsdBuU7yYBRvfQsPpNtdYN2DSH2PaSVFQVV0Ios1fv85duWCeQ-lZxOVrQf2g3BrgiDLb3XopwB7aCK3wmK785aDZGpMJcWQ',
        }
      }
    ]
  }
];

export const sampleActivities: ActivityItem[] = [
  {
    id: 'act_1',
    type: 'invite',
    user: {
      id: 'chloe',
      name: 'Chloe Lens',
      handle: 'chloe.lens',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBtFr2F16t8bmDA9IeR9gQFk2DQexgKYgMZUQ9e4U3wR7zPy9px_CKKHKUAQ9XIVYldFHt0-TXIyNIxH37ArgJWwNSjJG9jK_xFUliNXqxtyHtOKKQyLuITA2_CES8ViAByJqdLrN6g6UxfgtpS8uE52IP4_5z7i4Q1OqgheILHadBLsBtY53-RKUYAakcq8QYfLgQYR5sdomBsYe7Tc_zSRXKdkBEviIfKMO2XOb8eC4Jik2kE8gzeWSWWOEksbPq5dhKv9YXOCA',
    },
    message: 'Invited you to collaborate',
    targetTitle: '‘A Weekend in Ella’',
    timeAgo: '12m ago',
    unread: true,
    actionRequired: true,
    forkVersion: 'Fork v2.4',
  },
  {
    id: 'act_2',
    type: 'comment',
    user: {
      id: 'milo',
      name: 'Milo Lens',
      handle: 'milo_lens',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDobuu7cvuIdyUsa3diPmHeOsydIsme19Fd9nmC4dM0H6PJ4gYWdMqvL9X101TTBF5TTzyW-UWGWELh3FoJMHb2KPBDs5r8--P9djcUTDn8HzxD2eXbPSqflky4CBG0ReDWM4lEHRq_UCz5Ch5kFpOVljbzo04DF6ZcdjxTrSMX3pqsdBuU7yYBRvfQsPpNtdYN2DSH2PaSVFQVV0Ios1fv85duWCeQ-lZxOVrQf2g3BrgiDLb3XopwB7aCK3wmK785aDZGpMJcWQ',
    },
    message: 'commented on your Leica Q2 recipe: "Clean highlight transition"',
    targetTitle: 'Dappled Brutalism',
    timeAgo: '45m ago',
    unread: false,
  },
  {
    id: 'act_3',
    type: 'like',
    user: {
      id: 'sarah',
      name: 'Sarah Wood',
      handle: 'sarah_bakes',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDpdU8n27tIk0IuRYGCnaATqolu_b9RHKvOr2if26Z8qy6SA74KlFvdLPgnvr5KzkXBD43Bbnqtnlt5ZOrCeyVe5CWaU5BLJPM2esdcuqFDd9umMlD6xfquMpMJMUyhvQ_YNlJcyWyhydqdiMd-mHOcOQEa8LPjUV1DVIHfwE6ZxeN4w3zOENwqbWD83TkG4a9HkQsBqEOTJlV7VWEVH0rjLh6ZIAXlzzCLHCNYPYkk6_08-QZEC7UTXfyKYuT4lIKDSela2pFErQ',
    },
    message: 'saved your process recipe to Nordic Ceramics collection',
    timeAgo: '2h ago',
    unread: false,
  }
];

export const sampleMessages: MessageThread[] = [
  {
    id: 'msg_1',
    user: {
      id: 'chloe',
      name: 'Chloe Lens',
      handle: 'chloe.lens',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBtFr2F16t8bmDA9IeR9gQFk2DQexgKYgMZUQ9e4U3wR7zPy9px_CKKHKUAQ9XIVYldFHt0-TXIyNIxH37ArgJWwNSjJG9jK_xFUliNXqxtyHtOKKQyLuITA2_CES8ViAByJqdLrN6g6UxfgtpS8uE52IP4_5z7i4Q1OqgheILHadBLsBtY53-RKUYAakcq8QYfLgQYR5sdomBsYe7Tc_zSRXKdkBEviIfKMO2XOb8eC4Jik2kE8gzeWSWWOEksbPq5dhKv9YXOCA',
    },
    lastMessage: 'Are we locking the 35mm slides before sunrise?',
    timeAgo: '5m ago',
    unreadCount: 2,
    online: true,
  },
  {
    id: 'msg_2',
    user: {
      id: 'milo',
      name: 'Milo Lens',
      handle: 'milo_lens',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDobuu7cvuIdyUsa3diPmHeOsydIsme19Fd9nmC4dM0H6PJ4gYWdMqvL9X101TTBF5TTzyW-UWGWELh3FoJMHb2KPBDs5r8--P9djcUTDn8HzxD2eXbPSqflky4CBG0ReDWM4lEHRq_UCz5Ch5kFpOVljbzo04DF6ZcdjxTrSMX3pqsdBuU7yYBRvfQsPpNtdYN2DSH2PaSVFQVV0Ios1fv85duWCeQ-lZxOVrQf2g3BrgiDLb3XopwB7aCK3wmK785aDZGpMJcWQ',
    },
    lastMessage: 'Check the highlights on column 4 in the raw file.',
    timeAgo: '1h ago',
    unreadCount: 1,
    online: false,
  }
];
