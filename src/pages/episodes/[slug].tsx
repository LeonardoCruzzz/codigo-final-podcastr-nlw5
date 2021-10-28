import { format } from 'date-fns';
import parseISO from 'date-fns/parseISO';
import Image from 'next/image';
import Link from 'next/link';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { api } from '../../services/api';
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';
import ptBR from 'date-fns/locale/pt-BR';
import styles from './episode.module.scss';
import Head from 'next/head';
import { usePlayer } from '../../contexts/PlayerContext';

type Episode = {
    id: string;
    title: string;
    members: string;
    publishedAt: string;
    thumbnail: string;
    description: string;
    url: string;
    duration: number;
    durationAsString: string;
}

type EpisodeProps = {
    episode: Episode;
}

export default function Episode({ episode }: EpisodeProps) {
    const { play } = usePlayer();

    const router = useRouter();

    return (
        <div className={styles.episode}>
            <Head>
                <title>{episode.title} | Podcastr</title>
            </Head>
            <div className={styles.thumbnailContainer}>
                <Link href='/'>
                <button>
                    <img src="/arrow-left.svg" alt="Voltar"/>
                </button>
                </Link>
                <Image width={700} height={160} src={episode.thumbnail} objectFit='cover' />
                <button onClick={() => play(episode)}>
                    <img src="/play.svg" alt="Tocar"/>
                </button>
            </div>
            <header>
                <h1>{episode.title}</h1>
                <span>{episode.members}</span>
                <span>{episode.publishedAt}</span>
                <span>{episode.durationAsString}</span>
            </header>

            <div className={styles.description} dangerouslySetInnerHTML={{__html: episode.description}} />

        </div>

    )
}

export const getStaticPaths: GetStaticPaths = async () => {
    const { data } = await api.get('episodes', {
        params: {
            _limit: 12,
            _sort: 'published_at',
            _order: 'desc'
        }
    })

    const paths = data.map(episode => {
        return {
            params : {
                slug: episode.id
            }
        }
    })

    return {
        paths: paths,
        fallback: 'blocking'
    }
}

export const getStaticProps: GetStaticProps = async (ctx) => {
    const {slug} = ctx.params;
    const { data } = await api.get(`/episodes/${slug}`);
    const episode = {
        id: data.id,
        title: data.title,
        thumbnail: data.thumbnail,
        description: data.description,
        members: data.members,
        publishedAt: format(parseISO(data.published_at), 'dd MMM yy', {locale: ptBR}),
        duration: Number(data.file.duration), 
        durationAsString: convertDurationToTimeString(Number(data.file.duration)),
        url: data.file.url,
    }

    return {
        props: {episode},
        revalidate: 60 * 60 * 24,
    }
}