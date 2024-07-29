package com.mycompany.myapp.repository;

import com.mycompany.myapp.domain.Leave;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Leave entity.
 */
@Repository
public interface LeaveRepository extends JpaRepository<Leave, Long> {
    default Optional<Leave> findOneWithEagerRelationships(Long id) {
        return this.findOneWithToOneRelationships(id);
    }

    default List<Leave> findAllWithEagerRelationships() {
        return this.findAllWithToOneRelationships();
    }

    default Page<Leave> findAllWithEagerRelationships(Pageable pageable) {
        return this.findAllWithToOneRelationships(pageable);
    }

    @Query(
        value = "select jhiLeave from Leave jhiLeave left join fetch jhiLeave.employee",
        countQuery = "select count(jhiLeave) from Leave jhiLeave"
    )
    Page<Leave> findAllWithToOneRelationships(Pageable pageable);

    @Query("select jhiLeave from Leave jhiLeave left join fetch jhiLeave.employee")
    List<Leave> findAllWithToOneRelationships();

    @Query("select jhiLeave from Leave jhiLeave left join fetch jhiLeave.employee where jhiLeave.id =:id")
    Optional<Leave> findOneWithToOneRelationships(@Param("id") Long id);
}
