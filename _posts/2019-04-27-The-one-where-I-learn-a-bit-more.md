---
title: "Intro to .USDZ and AR Quick Look part 2."
author: Ashlee Muscroft
category: blog
layout: post
tags: ['AR quick look','apple','iOS 12','Safari 12','ARKit','.usdz']
image:
  path: /assets/img/placeholder.png
  copyright: Ashlee Muscroft
ccl: by-nc-nd
---
Yesterday I tried to upload some AR Quick Look .usdz files. It didn't go so well. As of writing my cute farm animals do not display in AR QuickLook but they will. Soon? 

I originally created them using unity and trying out the new, but still in preview. USD package, this preview package has an export to .usdz format. It hasn't worked for me in unity 2018.3.9f1. 

I set out to debugging my site, [the intro videos from apple](https://developer.apple.com/videos/play/wwdc2018/603/)
(...around 16mins in) paint a clear pictue on what is needed.

-Content Type declared on your server.
-a link tag with `rel="ar"` attribute.
-an embedded .usdz file.

I had checked github pages earlier for the MIME-type, github subscribe to a opensource MIME-type dictionary both .usdz and .usd were defined. So the next thing I had to do was test the file format.

The quickest way I could think to verified my files, was to send it to myself via iMessage. If you weren't aware iMessage has built in AR Quick Look. You can sent AR items to anyone on iOS 12 via iMessage.

I downloaded a .usdz file from Apple's demo gallery and placed it with my other .usdz files. When I tried to view this file on my iPhones' safari. I was presented to download a zip version of the file once again.

Right away I suspected that it was the MIME-type not being implemented. I knew this because this site is actually served by netlify and not github pages. I knew this or atlease has a 99% hunch it was a unknown content-type. Because I had read earlier in their docs the ability in setting your own headers.

_I got it wrong_
That is I got the docs wrong and I tried to apply the content-type to all `blog/*` pages. After contacting netlify support they put me straight. It would be best to define the file type and set it's content type
```
/*.usdz
  Content-Type: model/vnd.usdz+zip;
```  
_It's still wrong_
I was still unable to get the file to load, the file directly from apple. What is going on? I think started to debug on my phone. I notice in the log there was a failed to load frame error. This is a safari error that occurs when it doesn't understand the content type.

I went back to Netlify support and asked how could I verify my content-type was set on the site? They suggested I use curl -v (verbose) and curl my site's .usdz file. Doing that confirmed a major verbal WHAT!

The content type was applied correctly, the worst type of bug to debug. But I quickly thought what does apple do?

Spolier Alert, it isn't follow there own suggestion!

I fired off the curl request to the AR quicklook gallery and the webkit blog post on .USDZ
```
curl -v https://webkit.org/demos/ar/heart.usdz -o /dev/null
curl -v https://developer.apple.com/arkit/gallery/models/wateringcan/wateringcan.usdz -o /dev/null
```
Despite the webkit post stating to use ```model/vnd.usdz+zip;``` after ios12/ safari 12 as it is the official MIME-type. The webkit article type was the 'older' pixar one. ```model/vnd.pixar.usd;``` The AR Quicklook gallery was using a simpler ```model/usd;```

I then changed my sites content type to:
```
/*.usdz
  Content-Type: model/vnd.pixar.usd;
``` 
Now the watering can works on iOS12 safari.

One other slipup, was the need to include, 'include' config in the _config.yaml file as this site is built with Jekyll. Netlify needs a _header file to exists when you define custom headers. The Jekyll site builder doesn't include these automatically. It's a slipup on my part as this was in the first paragraph of netlify docs on creating custom header. oops.

<div class="row">
  <div class="col offset-l3 l6 s12">
    <div class="row"> 
      <div class="card">
        <a class="card-image" rel="ar" href="/assets/models/wateringcan.usdz">
          <img src="{{ "/assets/img/models/wateringcan.jpg" | prepend: site.url }}">
        </a>
      </div>
    </div>
  </div>  
</div>