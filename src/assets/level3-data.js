// Dữ liệu kịch bản Màn 3: "Góc khuất khung hình"
// Kể chuyện tương tác về nhận diện deepfake tống tiền và bảo vệ dữ liệu cá nhân.
window.level3Scenario = {
  id: 'goc-khuat-khung-hinh',
  title: 'Góc khuất khung hình',
  subtitle: 'Đối diện với video nhạy cảm cắt ghép · 21:15',
  budget: {
    initial: 1500000,
    demand: 1500000,
    demandOriginal: 2000000,
    extortMore: 3000000,
    recipient: 'NGUYEN HOANG PHUC',
    recipientNote: 'Ví điện tử mô phỏng · 091 *** 892',
    transactionCode: 'DF-GUARD-2115'
  },
  theme: {
    background: '#f1f0ec',
    incoming: '#ffffff',
    outgoing: '#fff0b8',
    text: '#262626',
    action: '#34383c',
    accent: '#e9c66e'
  },
  people: {
    ban: { name: 'Bạn', avatar: 'B' },
    scammer: { name: 'user_849201', avatar: '?' },
    khanh: { name: 'Khánh', phoneName: 'Khánh · Di động', avatar: 'K' },
    lan: { name: 'Chị Lan · Cố vấn SV', phoneName: 'Tổng đài 111 · Hỗ trợ bảo vệ', avatar: 'L' }
  },
  dialogues: {
    startNotice: 'Hoàn thiện nốt phần slide thuyết trình trước 22:00. Giữ bình tĩnh và kiểm soát an toàn thông tin cá nhân.',
    khanhStart: 'Ê, phần mở đầu tao làm xong rồi nha. Mày check lại số liệu slide 4 giúp tao với, 10 giờ tụi mình ghép file.',
    khanhNormal: 'Nhớ check kỹ bảng khảo sát 150 mẫu ở slide 4 nha, cô dặn chỗ đó dễ bị hỏi vặn lắm á.',
    scammerThreat1: 'Muốn clip này lên thẳng Confession trường hay gửi cho từng đứa trong list bạn bè của mày?',
    scammerThreat2: '2.000.000đ trong 15 phút. Chuyển xong tao xóa sạch file gốc. Đừng có dại mà chặn, tao nắm hết Facebook mấy đứa bạn thân của mày rồi.',
    scammerDiscount: 'Khỏi giả nai. Thằng Khánh với mấy đứa lớp mày đây chứ đâu? Giảm cho mày còn 1.500.000đ, chuyển lẹ trước khi tao bấm gửi.',
    scammerDelayReply: 'Tao cho mày đúng 10 phút nữa. Im lặng là tao bấm đăng liền.',
    scammerRefuseCall: 'Đừng có gọi. Chuyển tiền xong tự khắc biến mất.',
    scammerExtortMore: 'Nhận được tiền rồi. Nhưng file này còn lưu trên server dự phòng, muốn xóa vĩnh viễn thì chuyển thêm 3.000.000đ nữa trong 10 phút.',

    repliesToScammer: {
      deny: {
        id: 'reply-deny',
        label: 'Mày là ai? Xóa ngay đi!',
        text: 'Mày là ai? Xóa ngay đi!'
      },
      beg: {
        id: 'reply-beg',
        label: 'Đừng gửi, tao không đủ tiền.',
        text: 'Đừng gửi bậy bạ, tao là sinh viên không có đủ tiền đâu!'
      },
      delay: {
        id: 'reply-delay',
        label: 'Khoan đã, để tao xoay tiền.',
        text: 'Từ từ, đừng gửi bậy. Để tao xoay tiền đã.'
      }
    },

    frameInspector: {
      title: 'Trình kiểm tra khung hình (Frame Inspector)',
      subtitle: 'Đối chiếu các dấu vết kỹ thuật số trong tệp video đe dọa',
      image: 'assets/level3-deepfake-preview.svg',
      findings: [
        {
          target: 'Vùng mặt & viền cằm',
          detail: 'Viền cằm và cổ bị nhòe bất thường khi nhân vật xoay góc nghiêng; ánh sáng trên mặt ngả vàng đèn bàn trong khi ánh sáng phòng phía sau lại màu trắng lạnh.'
        },
        {
          target: 'Chi tiết trang phục',
          detail: 'Cổ áo phông xanh đậm có nếp gấp và vệt sáng đứng yên một cách phi tự nhiên, khớp y hệt góc quay trước ngực.'
        },
        {
          target: 'Thông tin âm thanh & Metadata',
          detail: 'Không có âm thanh gốc của nhân vật (chỉ có tiếng ồn trắng lặp lại mỗi 2 giây). Tốc độ khung hình bị giật ở các đoạn chuyển góc.'
        }
      ]
    },

    oldStory: {
      title: 'Kho Story cũ · Thứ Năm lúc 22:10',
      caption: 'Cày deadline bài thuyết trình 📚🥲',
      image: 'assets/level3-story-post.svg',
      details: 'Story đăng công khai 3 ngày trước, quay góc cận mặt trước bàn học, mặc đúng chiếc áo phông xanh đậm dưới ánh đèn bàn vàng.'
    },

    friendListProof: {
      title: 'Ảnh chụp màn hình kẻ gian gửi',
      image: 'assets/level3-friendlist.svg',
      caption: 'Kẻ tống tiền chụp lại mục Bạn bè đang để chế độ Công khai trên trang cá nhân của bạn.'
    },

    khanhChat: {
      withoutStory: {
        user: 'Khánh ơi, tự nhiên có nick lạ nhắn tống tiền tao, nó gửi cái clip ghép mặt tao ghê lắm…',
        reply1: 'Bình tĩnh! Mày tuyệt đối đừng chuyển một đồng nào nha. Tuần trước bên khoa Kinh tế cũng có đứa bị y chang, toàn lấy mặt từ story công khai ghép vô rồi dọa gửi list bạn bè.',
        reply2: 'Để tao canh trang Confession trường cho, nãy giờ chẳng có bài nào duyệt đâu. Mày vào khóa danh sách bạn bè với chụp lại ID nick đó làm bằng chứng đi.'
      },
      withStory: {
        user: 'Khánh ơi, có nick lạ lấy mặt tao từ cái story hôm thứ Năm ghép vô clip bậy để tống tiền 1 triệu rưỡi.',
        reply1: 'Trời, đúng bài deepfake dạo này rồi! Tốt nhất là mày đừng chuyển xu nào, khóa riêng tư Facebook lại rồi chụp màn hình bằng chứng gửi tao giữ phụ cho.',
        reply2: 'Yên tâm, tụi tao biết mày thức cày deadline với tao tối thứ Năm mà. Cứ bình tĩnh làm xong cái slide 4 rồi báo cáo nick nó.'
      }
    },

    calls: {
      khanh: [
        { sender: 'khanh', text: 'Alo, nghe giọng tao nè, hít thở sâu đi. Đừng có run.' },
        { sender: 'ban', text: 'Nó chụp cả nick mày với mấy đứa trong lớp, dọa gửi hết nếu tao không chuyển tiền.' },
        { sender: 'khanh', text: 'Nó chụp từ list bạn bè công khai trên tường mày đó! Tụi tao có nhận được thì cũng biết thừa là đồ ghép, không ai trách mày đâu.' },
        { sender: 'khanh', text: 'Mày chụp lại tin nhắn, khóa riêng tư rồi báo cáo nick nó ngay đi. Tao lo phần Confession trường cho.' }
      ],
      lan: [
        { sender: 'lan', text: 'Chị Lan nghe đây em. Em cứ bình tĩnh nhé, tuyệt đối không chuyển tiền và không gửi thêm bất kỳ hình ảnh nào để chứng minh với họ.' },
        { sender: 'lan', text: 'Em hãy chụp màn hình đường dẫn tài khoản và nội dung đe dọa, khóa quyền riêng tư toàn bộ trang cá nhân, rồi gửi mã báo cáo cho nhà trường hoặc cơ quan công an nếu họ tiếp tục làm phiền.' },
        { sender: 'lan', text: 'Kẻ gian thường đánh vào sự sợ hãi để tống tiền dây chuyền. Em không có lỗi trong chuyện này, nhà trường luôn có kênh hỗ trợ tâm lý và an toàn cho em.' }
      ]
    },

    endNotice: {
      khanhEnd: '22 giờ rồi nè, trên Confession trường vẫn im re chẳng có gì hết. Mày gửi slide 4 qua đây đi, mai nhóm mình thuyết trình ngon lành.',
      banEnd: 'Đây, tao vừa gửi qua mail rồi đó. Cảm ơn mày tối nay nha.'
    },

    hints: {
      level1: 'Ánh sáng đèn bàn vàng và chiếc áo phông xanh trong khung hình trông rất quen—bạn có từng đăng clip nào tương tự gần đây không?',
      level2: 'Hãy thử mở Trang cá nhân để xem lại Kho story cũ và kiểm tra xem Danh sách bạn bè có đang để Công khai không.'
    }
  }
};
