import {CommentEmbed, DiscussionEmbed} from "disqus-react";
import {CONFIG} from "site.config"
import {useEffect, useState} from "react"
import styled from "@emotion/styled"
import {useRouter} from "next/router"
import useScheme from "src/hooks/useScheme"

type Props = {
  id: string
  slug: string
  title: string
}

const Disqus: React.FC<Props> = ({id, slug, title}) => {
  const [value, setValue] = useState(0);
  const [scheme] = useScheme();
  const router = useRouter()

  const disqusConfig = {
    url: `${CONFIG.link}/${slug}`,
    identifier: id, // Single post id
    title: title, // Single post title
    sso: {
      width: '100%'
    }
  }

  useEffect(() => {
    // do something.

    return () => {
      // something
    }
  }, [scheme, router]);

  return (
      <>
        <StyledWrapper id="comments">

          <DiscussionEmbed
              shortname={CONFIG.disqus.config.shortname}
              config={disqusConfig}
          />

          {/*
          <CommentEmbed
              commentId={id}
              showMedia={true}
              showParentComment={true}
              width={420}
              height={320}
          />
          */}

        </StyledWrapper>
      </>
  )
};

export default Disqus;

const StyledWrapper = styled.div`
  margin-top: 2.5rem;
  @media (min-width: 768px) {
    margin-left: -4rem;
  }
`;