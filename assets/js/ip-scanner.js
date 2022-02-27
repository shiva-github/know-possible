
(function($) {
    setTimeout(function() {
        $.getJSON("https://api.ipify.org?format=json", function(data) {
            $("#publicip").val(data.ip);
        })
        getLocalIP().then((ipAddr) => {
            $('#networkname').val(ipAddr);
        });
    }, 1000);
    $('#submit').click(function() {
        let ip  = $('#privateip').val();
        if (ip == '') {
            return;
        }
        let listfinal = creteips(getIpRangeFromAddressAndNetmask(ip));
        listfinal.shift(1);
        listfinal.pop()
        let htmlstring = ''
        for (let i in listfinal) {
            htmlstring += `<tr>
            <th scope="row" id="counter-${listfinal[i]}">${parseInt(i)+1}</th>
            <td id="ip-${listfinal[i]}">${listfinal[i]}</td>
            <td><button data-ip="${listfinal[i]}"  id="button-${listfinal[i]}" class="btn btn-primary ping">PING</button></td>
            <td id="status-${listfinal[i]}">-</td>
            <td id="statuscode-${listfinal[i]}">-</td>
            </tr>`;
            
        }

        $('#ip-t-body').html(htmlstring);

    });

    
    $('body').on('click', '.hitall', function() {
        $('.ping').click();
    });
    $('body').on('click', '.ping', function() {
        let val = $(this).data('ip');
        $(this).prop('disabled', true);
        let timeout_time = 10000; //10 secs
        try {
            let dt_start = new Date();
            let protocol = location.protocol != '' ? location.protocol : 'http';
            let url_complete = `${protocol}//${val}/`;
            console.log(url_complete)
            $.ajax({
                type: "POST",
                url: url_complete,
                timeout: timeout_time,
                success: function(json) {
                    console.log("JSON loaded: " + json);
                },
                error: function(request, status, err) {
                    let diff = Math.abs(new Date() - dt_start);
                    if (diff < 1000) {
                        document.getElementById(`counter-${val}`).style.backgroundColor = 'green'; 
                        document.getElementById(`counter-${val}`).style.color = 'white'; 
                    } else {
                        if (diff >= timeout_time) {
                            document.getElementById(`counter-${val}`).style.backgroundColor = 'black'; 
                            document.getElementById(`counter-${val}`).style.color = 'white'; 
                        } else {
                            document.getElementById(`counter-${val}`).style.backgroundColor = 'yellow'; 
                            document.getElementById(`counter-${val}`).style.color = 'black'; 
                        }
                    }
                    document.getElementById('statuscode-'+val).innerHTML = request.status;
                    if (status == "timeout") {
                        document.getElementById(`status-${val}`).innerHTML = 'ERROR - Time:' + diff;
                    } else {
                        document.getElementById(`status-${val}`).innerHTML = 'Timeout - Time:' + diff;
                    }
                }
            });
        } catch(ex) {
            
        }

    });

})(jQuery)

function creteips (listBase) {
    var listBase1 = listBase[0];
    var listBase2 = listBase[1];

    let one = listBase1.split('.');
    let two = listBase2.split('.');
    let completeiplist = []
    for (let i = one[0]; i <= two[0]; i++) {
        for (let j = one[1]; j <= two[1]; j++) {
            for (let k = one[2]; k <= two[2]; k++) {
                for (let l = one[3]; l <= two[3]; l++) {
                    completeiplist.push(`${i}.${j}.${k}.${l}`);
                }
            }
        }
    }
    return completeiplist;
}

function getIpRangeFromAddressAndNetmask(str) {
    var part = str.split("/");
    var ipaddress = part[0].split('.');
    var netmaskblocks = ["0","0","0","0"];
    if(!/\d+\.\d+\.\d+\.\d+/.test(part[1])) {
      netmaskblocks = ("1".repeat(parseInt(part[1], 10)) + "0".repeat(32-parseInt(part[1], 10))).match(/.{1,8}/g);
      netmaskblocks = netmaskblocks.map(function(el) { return parseInt(el, 2); });
    } else {
      netmaskblocks = part[1].split('.').map(function(el) { return parseInt(el, 10) });
    }
    var invertedNetmaskblocks = netmaskblocks.map(function(el) { return el ^ 255; });
    var baseAddress = ipaddress.map(function(block, idx) { return block & netmaskblocks[idx]; });
    var broadcastaddress = baseAddress.map(function(block, idx) { return block | invertedNetmaskblocks[idx]; });
    return [baseAddress.join('.'), broadcastaddress.join('.')];
  }
  

function getLocalIP() {
    return new Promise(function(resolve, reject) {
      var RTCPeerConnection = window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
        
      if (!RTCPeerConnection) {
        reject('Your browser does not support this API');
      }
      
      var rtc = new RTCPeerConnection({iceServers:[]});      
      var addrs = {};
      addrs["0.0.0.0"] = false;
      
      function grepSDP(sdp) {
          var hosts = [];
          var finalIP = '';
          sdp.split('\r\n').forEach(function (line) {
              if (~line.indexOf("a=candidate")) {
                  var parts = line.split(' '),
                      addr = parts[4],
                      type = parts[7];
                  if (type === 'host') {
                      finalIP = addr;
                  }
              } else if (~line.indexOf("c=")) {
                  var parts = line.split(' '),
                      addr = parts[2];
                  finalIP = addr;
              }
          });
          return finalIP;
      }
      
      if (1 || window.mozRTCPeerConnection) {
          rtc.createDataChannel('', {reliable:false});
      };
      
      rtc.onicecandidate = function (evt) {
          if (evt.candidate) {
            var addr = grepSDP("a="+evt.candidate.candidate);
            resolve(addr);
          }
      };
      rtc.createOffer(function (offerDesc) {
          rtc.setLocalDescription(offerDesc);
      }, function (e) { console.warn("offer failed", e); });
    });
  }
// This code for Logging console in html
//   if (typeof console  != "undefined") {
//     if (typeof console.log != 'undefined'){
//       console.olog = console.log;
//     }
//     else {
//         console.olog = function() {};
//     }
// }

// console.log = function(message) {
//   console.olog(message);
//   $('#debugDiv').append('<p>' + message + '</p>');
// };
// console.error = console.debug = console.info =  console.log
