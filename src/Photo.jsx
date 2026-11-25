import { useState } from 'react'

export const IMG = {
  whole: '/images/mango-whole.jpg',
  sliced: '/images/mango-sliced.jpg',
  cubes: '/images/mango-cubes.jpg',
  bottle: '/images/mango-bottle.jpg',
  splash: '/images/mango-splash.jpg',
  field: '/images/mango-field.jpg',
  closeup: '/images/mango-closeup.jpg'
}

export default function Photo({
  src,
  alt = 'Mango 3D Image',
  className = '',
  grad = 'from-[#fff2d2] to-[#fed88f]',
  priority = false,
  fit = 'cover'
}) {
  const [ok, setOk] = useState(true)
  const [loaded, setLoaded] = useState(false)

  const fitClass = fit === 'contain' ? 'object-contain' : 'object-cover'

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${grad} ${className}`}>
      {ok && (
        <img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          onLoad={() => setLoaded(true)}
          onError={() => setOk(false)}
          className={`absolute inset-0 w-full h-full ${fitClass} object-center transition-all duration-700 ${
            loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          }`}
        />
      )}
    </div>
  )
}
