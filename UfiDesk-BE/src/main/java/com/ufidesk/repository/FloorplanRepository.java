package com.ufidesk.repository;

import com.ufidesk.model.Floorplan;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FloorplanRepository extends MongoRepository<Floorplan, String> {
    Optional<Floorplan> findByMainTrue();
}


